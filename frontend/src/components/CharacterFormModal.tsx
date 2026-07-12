import { useEffect, useState, type FormEvent } from "react";
import type { Character } from "../types/character";

export type CharacterFormValues = {
  char: string;
  pinyin: string;
  writting_known: boolean;
};

type CharacterFormModalProps = {
  mode: "add" | "edit";
  isOpen: boolean;
  initialCharacter?: Character | null;
  prefilledChar?: string;
  onConfirm: (values: CharacterFormValues) => void;
  onCancel: () => void;
};

export default function CharacterFormModal({
  mode,
  isOpen,
  initialCharacter = null,
  prefilledChar = "",
  onConfirm,
  onCancel,
}: CharacterFormModalProps) {
  const [char, setChar] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [writtingKnown, setWrittingKnown] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === "edit" && initialCharacter) {
      setChar(initialCharacter.char);
      setPinyin(initialCharacter.pinyin);
      setWrittingKnown(initialCharacter.writting_known);
      return;
    }

    setChar(prefilledChar);
    setPinyin("");
    setWrittingKnown(false);
  }, [isOpen, mode, initialCharacter, prefilledChar]);

  if (!isOpen) {
    return null;
  }

  const isConfirmDisabled = char.trim() === "" || pinyin.trim() === "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isConfirmDisabled) {
      return;
    }

    onConfirm({
      char: char.trim(),
      pinyin: pinyin.trim(),
      writting_known: writtingKnown,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="character-form-title" className="modal-title">
          {mode === "add" ? "Add character" : "Edit character"}
        </h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="modal-field">
            <span className="modal-field-label">character</span>
            <input
              type="text"
              value={char}
              readOnly={mode === "edit"}
              onChange={(event) => setChar(event.target.value)}
            />
          </label>
          <label className="modal-field">
            <span className="modal-field-label">pinyin</span>
            <input
              type="text"
              value={pinyin}
              maxLength={6}
              onChange={(event) => setPinyin(event.target.value)}
            />
          </label>
          <div className="modal-field modal-field-toggle">
            <span className="modal-field-label">writting known</span>
            <label className="toggle">
              <input
                type="checkbox"
                role="switch"
                checked={writtingKnown}
                onChange={(event) => setWrittingKnown(event.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
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
