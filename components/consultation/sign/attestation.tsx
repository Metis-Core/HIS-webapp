import { FaSignature } from 'react-icons/fa';

interface AttestationProps {
  signerName: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

export default function Attestation({ signerName, checked, disabled, onChange }: AttestationProps) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3">
      <div className="flex items-start gap-2">
        <FaSignature className="mt-1 text-brand" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">Sign encounter</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            By signing, {signerName} attests that the documentation above is accurate and complete. The encounter is
            locked once signed; later notes are added as addenda.
          </p>
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-surface-raised p-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5"
          disabled={disabled}
        />
        <span>
          I, <span className="font-medium">{signerName}</span>, attest that the information in this encounter is true
          and accurate to the best of my knowledge.
        </span>
      </label>
    </section>
  );
}
