type Props = {
  onCopyResult: () => void;
  onCopyAssumptions: () => void;
  onShare: () => void;
  onCsv: () => void;
};

const secondaryButton = 'rounded-full bg-blue-50 px-4 py-2 font-bold text-blue-700';

export function ExportButtons({ onCopyResult, onCopyAssumptions, onShare, onCsv }: Props) {
  return (
    <div className="mt-5 flex flex-wrap gap-2 no-print" aria-label="Result actions">
      <button className="rounded-full bg-blue-700 px-4 py-2 font-bold text-white" type="submit" aria-label="Update the calculator estimate">
        Update estimate
      </button>
      <button className={secondaryButton} type="button" onClick={onCopyResult} aria-label="Copy the result summary">
        Copy result
      </button>
      <button className={secondaryButton} type="button" onClick={onShare} aria-label="Copy a shareable link with the current inputs">
        Copy share link
      </button>
      <button className={secondaryButton} type="button" onClick={onCsv} aria-label="Download the current result as a CSV file">
        Download CSV
      </button>
      <button className={secondaryButton} type="button" onClick={onCopyAssumptions} aria-label="Copy the professional boundary note">
        Copy assumptions
      </button>
      <button className="rounded-full border border-line px-4 py-2 font-bold" type="button" onClick={() => window.print()} aria-label="Print this calculator result or save as PDF">
        Print / PDF
      </button>
    </div>
  );
}
