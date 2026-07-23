type MissingHskCharactersModalProps = {
  isOpen: boolean;
  level: number | null;
  characters: string[];
  onClose: () => void;
};

export default function MissingHskCharactersModal({
  isOpen,
  level,
  characters,
  onClose,
}: MissingHskCharactersModalProps) {
  if (!isOpen || level === null) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="missing-hsk-characters-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="missing-hsk-characters-title" className="modal-title">
          Missing characters for HSK {level}
        </h2>
        <div className="character-words-modal-content">
          {characters.length === 0 ? (
            <p className="character-words-modal-heading">
              No missing characters — this level is complete.
            </p>
          ) : (
            <>
              <p className="home-missing-characters-hint">
                (those characters are ordered by frequency. If you want to learn
                them, we are suggesting you to learn them in that order)
              </p>
              <p className="home-missing-characters-list">
                {characters.join("、")}
              </p>
            </>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="modal-button-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
