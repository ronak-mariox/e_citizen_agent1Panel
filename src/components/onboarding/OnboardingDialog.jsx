import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import * as onboardingApi from '../../api/onboarding.js';
import { getErrorMessage } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/onboarding.css';

/**
 * The documents an agent has to hand in before their console opens.
 *
 * Which documents is not this component's decision — an admin picks them per
 * account when they create it (admin panel, "Required documents"), so the
 * checklist is fetched rather than declared here. A posting that asks for a
 * degree and one that asks for a police verification both render from the same
 * code.
 *
 * Two stages, because there are two gates:
 *
 *   upload  the checklist, until everything asked for has been handed in
 *   review  a waiting screen, until an admin has verified what was handed in
 *
 * Which one is showing is the server's `verificationStatus`, not a local step
 * counter — an admin rejecting a document hours later has to send the agent
 * back to the first stage, and only the server knows that happened.
 *
 * It is a gate, not a prompt: there is no close button, Escape does nothing and
 * the backdrop does not dismiss. The only two ways out are being verified or
 * signing out, and the sign-out is offered precisely because an agent waiting
 * on someone else must not be stuck on a screen with no exit.
 *
 * The API enforces both gates on its own side — the complete route re-checks
 * the list, and `requireVerifiedAgent` refuses every work route until an admin
 * has signed off — so a reload or a devtools poke gets past this dialog and
 * into an account that still cannot do anything. That is the point of keeping
 * the decision on the account rather than in a piece of state here.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = 'image/jpeg,image/png,image/webp,application/pdf';

/* EDUCATION_VARIANTS on the API. The education row is a choice of three rather
   than three rows: the requirement is the 10th, the 12th *or* the degree,
   whichever the agent has, and this is where they say which one they are
   sending. */
const VARIANTS = [
  { value: '10th', label: '10th certificate' },
  { value: '12th', label: '12th certificate' },
  { value: 'graduation', label: 'Graduation certificate' },
];

/** "2.4 MB", "812 KB" — the size next to a file the agent just chose. */
function fileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** One checklist row: what is wanted, what is there, and the two buttons. */
function DocumentRow({ row, busy, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [rowError, setRowError] = useState(null);

  /* Seeded from whatever was sent before, so replacing a rejected 12th
     certificate does not silently re-send it as a 10th. Empty on a fresh row —
     the agent has to say which one rather than have one picked for them. */
  const [variant, setVariant] = useState(row.variant ?? '');

  const handleChoose = (event) => {
    const file = event.target.files?.[0];
    // Clear immediately, so choosing the same file twice after a failure still
    // fires a change event — the input keeps its value otherwise and the second
    // attempt looks like nothing happened.
    event.target.value = '';

    if (!file) return;

    /* Only the education row asks for one, and only there can it be missing.
       Checked before the upload rather than after, so the agent is not made to
       re-pick the file as well as the certificate. */
    if (row.takesVariant && !variant) {
      setRowError('Choose which certificate this is first.');
      return;
    }

    /* Checked here as well as by the API, only so the agent hears about a 6MB
       scan before spending the upload rather than after it. The server's limit
       is what actually decides. */
    if (file.size > MAX_BYTES) {
      setRowError('That file is larger than 5MB — try a smaller scan.');
      return;
    }

    setRowError(null);
    onUpload(row.type, file, row.takesVariant ? variant : undefined);
  };

  const held = Boolean(row.documentId);
  const rejected = row.status === 'rejected';

  return (
    <li className={`onboarding__row${rejected ? ' onboarding__row--rejected' : ''}`}>
      <div className="onboarding__rowMain">
        <span className="onboarding__rowName">
          {/* Once one is in, the row names the certificate that arrived rather
              than the requirement it satisfied. */}
          {held && row.variantLabel ? row.variantLabel : row.label}
          {held && !rejected && <span className="onboarding__tick" aria-hidden="true">✓</span>}
        </span>

        <span className="onboarding__rowMeta">
          {rejected
            ? `Rejected — ${row.rejectionReason ?? 'upload it again'}`
            : held
              ? `${row.originalName ?? 'Uploaded'} · ${fileSize(row.sizeBytes)}`
              : 'JPG, PNG or PDF · Max 5MB'}
        </span>

        {row.takesVariant && (
          <select
            className="onboarding__variant"
            value={variant}
            disabled={busy}
            aria-label="Which certificate"
            onChange={(event) => {
              setVariant(event.target.value);
              setRowError(null);
            }}
          >
            <option value="">Choose 10th, 12th or graduation…</option>
            {VARIANTS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {rowError && <span className="onboarding__rowError">{rowError}</span>}
      </div>

      <div className="onboarding__rowActions">
        {held && !rejected && (
          <button
            className="onboarding__ghost"
            type="button"
            disabled={busy}
            onClick={() => onRemove(row.documentId)}
          >
            Remove
          </button>
        )}

        <button
          className={held && !rejected ? 'onboarding__ghost' : 'onboarding__pick'}
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {held && !rejected ? 'Replace' : 'Upload'}
        </button>

        {/* Hidden rather than styled: a file input cannot be restyled reliably
            across browsers, so the button above drives it. */}
        <input
          className="onboarding__file"
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          tabIndex={-1}
          onChange={handleChoose}
        />
      </div>
    </li>
  );
}

export function OnboardingDialog() {
  const { user, applyUserPatch, signOut } = useAuth();

  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    onboardingApi
      .getOnboarding()
      .then((data) => {
        if (!cancelled) setChecklist(data);
      })
      .catch((caught) => {
        if (!cancelled) setError(getErrorMessage(caught));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* The page behind this must not scroll while it is open — a modal you can
     scroll past is a modal you can ignore. Restored on unmount rather than set
     to a literal, so a page that had its own overflow keeps it. */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  /* Every mutation returns the whole checklist, so they all land here. Wrapping
     them in one place is also what keeps two uploads from overlapping: `busy`
     disables every button, and the API replaces per type — two requests racing
     on the same row would leave one file stored and unreferenced. */
  const run = useCallback(async (action) => {
    setBusy(true);
    setError(null);

    try {
      setChecklist(await action());
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }, []);

  const handleUpload = (type, file, variant) =>
    run(() => onboardingApi.uploadDocument({ type, file, variant }));

  const handleRemove = (documentId) => run(() => onboardingApi.removeDocument(documentId));

  /**
   * Hand the checklist in. This does *not* open the console — it moves the
   * dialog to its waiting stage, because an admin still has to verify what was
   * uploaded. The response says so itself, so the stage follows it rather than
   * a local assumption about what submitting means.
   */
  const handleFinish = () => run(() => onboardingApi.completeOnboarding());

  /**
   * Ask whether an admin has got to it yet.
   *
   * The waiting stage has no way of hearing about a verdict on its own — there
   * are no sockets here — so it is a button rather than a poll. A poll would
   * spend an agent's request budget all evening on an answer that arrives once.
   *
   * Verification is folded into the session rather than refetched from
   * /auth/me: the gate in ProtectedRoute reads `documentsVerified`, so this is
   * the line that actually opens the console.
   */
  const handleRecheck = () =>
    run(async () => {
      const fresh = await onboardingApi.getOnboarding();

      if (fresh.isVerified) {
        applyUserPatch({
          documentsVerified: true,
          verificationStatus: 'verified',
          onboardingComplete: true,
          pendingDocuments: [],
        });
      }

      return fresh;
    });

  const rows = checklist?.requiredDocuments ?? [];
  const done = rows.filter((row) => row.documentId && row.status !== 'rejected').length;
  const ready = rows.length > 0 && done === rows.length;

  /* The waiting screen, once everything is in and nothing has been refused.
     Driven by the server's own word for it, so a rejection recorded while this
     dialog was open sends the agent back to the checklist on the next reply. */
  const waiting = checklist?.verificationStatus === 'in_review';

  return createPortal(
    <div className="onboarding" role="presentation">
      <div
        className="onboarding__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <header className="onboarding__head">
          <h2 className="onboarding__title" id="onboarding-title">
            {waiting ? 'Documents under review' : 'Documents required'}
          </h2>
          <p className="onboarding__lead">
            {waiting
              ? 'Everything you were asked for has been sent to your administrator. Your dashboard opens as soon as they verify it.'
              : `${user?.fullName ? `${user.fullName}, before` : 'Before'} you can start work, your administrator needs the documents below. Upload each one to continue.`}
          </p>

          {!waiting && rows.length > 0 && (
            <p className="onboarding__progress">
              {done} of {rows.length} uploaded
            </p>
          )}
        </header>

        {error && (
          <p className="onboarding__error" role="alert">
            {error}
          </p>
        )}

        {loading && <p className="onboarding__loading">Loading your checklist…</p>}

        {/* Waiting stage. The checklist is not repeated here — it is all in and
            there is nothing left to do to it — so what is shown instead is the
            one thing the agent actually wants: whether anyone has looked yet. */}
        {!loading && waiting && (
          <div className="onboarding__waiting">
            <span className="onboarding__waitingMark" aria-hidden="true">
              ✓
            </span>
            <p className="onboarding__waitingTitle">
              {rows.length} document{rows.length === 1 ? '' : 's'} submitted
            </p>
            <p className="onboarding__waitingBody">
              Verification is usually done within a working day. You can close this window and
              sign in again later — nothing is lost, and you will not be asked to upload again
              unless a document is rejected.
            </p>
          </div>
        )}

        {!loading && !waiting && (
          <ul className="onboarding__list">
            {rows.map((row) => (
              <DocumentRow
                key={row.type}
                row={row}
                busy={busy}
                onUpload={handleUpload}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        )}

        {/* An empty checklist means the admin asked for nothing. The gate never
            opens this dialog in that case, so reaching it means the list was
            cleared while the agent was looking at it — the button still works,
            and says so. */}
        {!loading && !waiting && rows.length === 0 && (
          <p className="onboarding__loading">
            Nothing is outstanding. Continue to your dashboard.
          </p>
        )}

        <footer className="onboarding__foot">
          <button
            className="onboarding__signout"
            type="button"
            disabled={busy}
            onClick={signOut}
          >
            Sign out
          </button>

          {waiting ? (
            <button
              className="onboarding__submit"
              type="button"
              disabled={busy}
              onClick={handleRecheck}
            >
              {busy ? 'Checking…' : 'Check again'}
            </button>
          ) : (
            <button
              className="onboarding__submit"
              type="button"
              disabled={busy || loading || (rows.length > 0 && !ready)}
              onClick={handleFinish}
            >
              {busy ? 'Working…' : 'Submit & continue'}
            </button>
          )}
        </footer>

        <p className="onboarding__note">
          {waiting
            ? 'If a document is rejected you will be asked for it again here, with the reason.'
            : 'Your administrator verifies these before your dashboard opens. If one is rejected you will be asked for it again here.'}
        </p>
      </div>
    </div>,
    document.body,
  );
}

export default OnboardingDialog;
