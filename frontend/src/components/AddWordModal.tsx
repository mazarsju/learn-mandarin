import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getMissingCharacters } from "../utils/wordCharacters";

export type WordFormValues = {
  word: string;
  definition: string;
};

type AddWordModalProps = {
  isOpen: boolean;
  knownCharacters: string[];
  onConfirm: (values: WordFormValues) => void;
  onCancel: () => void;
  onAddCharacter: (character: string) => void;
};

export default function AddWordModal({
  isOpen,
  knownCharacters,
  onConfirm,
  onCancel,
  onAddCharacter,
}: AddWordModalProps) {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");

  const knownCharacterSet = useMemo(
    () => new Set(knownCharacters),
    [knownCharacters],
  );

  const missingCharacters = useMemo(
    () => getMissingCharacters(word, knownCharacterSet),
    [word, knownCharacterSet],
  );

  useEffect(() => {
    if (isOpen) {
      setWord("");
      setDefinition("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isConfirmDisabled =
    word.trim() === "" || missingCharacters.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isConfirmDisabled) {
      return;
    }

    onConfirm({
      word: word.trim(),
      definition: definition.trim(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-word-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="add-word-title" className="modal-title">
          Add words
        </h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-field">
            <span className="modal-field-label">words</span>
            <input
              type="text"
              value={word}
              maxLength={10}
              onChange={(event) => setWord(event.target.value)}
            />
          </label>
          {missingCharacters.map((character) => (
            <div key={character} className="form-warning-row">
              <p className="form-warning">
                &quot;{character}&quot; does not exist yet in the database and
                needs to be added priorly.
              </p>
              <button
                type="button"
                className="form-warning-action"
                onClick={() => onAddCharacter(character)}
              >
                Add character {character}
              </button>
            </div>
          ))}
          <label className="modal-field">
            <span className="modal-field-label">definition</span>
            <input
              type="text"
              value={definition}
              maxLength={100}
              onChange={(event) => setDefinition(event.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="modal-button-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="modal-button-confirm-primary"
              disabled={isConfirmDisabled}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
