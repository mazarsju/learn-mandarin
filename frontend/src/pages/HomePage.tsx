import { useEffect, useMemo, useState } from "react";
import MissingHskCharactersModal from "../components/MissingHskCharactersModal";
import { TrophyIcon } from "../components/icons";
import Page from "../components/Page";
import type { Character } from "../types/character";
import {
  HSK_MAX_LEVEL,
  getHskLevelStatus,
  getMotivationMessages,
  type HskVocabularyEntry,
} from "../utils/homeMotivation";

async function fetchCharacters() {
  const response = await fetch("/characters", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to load characters.");
  }

  return (await response.json()) as Character[];
}

async function fetchHskVocabulary() {
  const response = await fetch("/hsk-vocabulary", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to load HSK vocabulary.");
  }

  return (await response.json()) as HskVocabularyEntry[];
}

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [hskVocabulary, setHskVocabulary] = useState<HskVocabularyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void Promise.all([fetchCharacters(), fetchHskVocabulary()])
      .then(([loadedCharacters, loadedVocabulary]) => {
        if (isMounted) {
          setCharacters(loadedCharacters);
          setHskVocabulary(loadedVocabulary);
        }
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load progress.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const recognizedCount = characters.length;
  const writtingCount = useMemo(
    () => characters.filter((character) => character.writting_known).length,
    [characters],
  );
  const hskLevelStatus = useMemo(
    () =>
      getHskLevelStatus(
        characters.map((character) => character.char),
        hskVocabulary,
      ),
    [characters, hskVocabulary],
  );
  const motivationMessages = useMemo(
    () => getMotivationMessages(recognizedCount),
    [recognizedCount],
  );

  const hskTitle =
    hskLevelStatus.currentLevel === null
      ? "Your HSK journey starts here"
      : hskLevelStatus.currentLevel === HSK_MAX_LEVEL
        ? `You've reached the top — HSK ${HSK_MAX_LEVEL}!`
        : `You're at HSK ${hskLevelStatus.currentLevel}!`;

  const hskProgressLabel =
    hskLevelStatus.nextLevel === null
      ? "Maximum HSK level reached. Outstanding work!"
      : `${hskLevelStatus.charactersToNextLevel} ${
          hskLevelStatus.charactersToNextLevel === 1 ? "character" : "characters"
        } to reach HSK ${hskLevelStatus.nextLevel}`;

  return (
    <Page title="Home">
      {isLoading && <p>Loading your progress...</p>}
      {error && <p className="table-error">{error}</p>}
      {!isLoading && !error && (
        <>
          <section className="home-hsk-card" aria-label="HSK level">
            <div className="home-hsk-badge">
              <span className="home-hsk-badge-label">HSK</span>
              <span className="home-hsk-badge-level">
                {hskLevelStatus.currentLevel ?? "—"}
              </span>
            </div>
            <div className="home-hsk-content">
              <p className="home-hsk-title">{hskTitle}</p>
              <p className="home-hsk-subtitle">
                Based on {recognizedCount}{" "}
                {recognizedCount === 1 ? "character" : "characters"} you are able
                to recognize
              </p>
              <div
                className="home-hsk-progress-track"
                role="progressbar"
                aria-valuenow={Math.round(hskLevelStatus.progressToNextLevel)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress to next HSK level"
              >
                <div
                  className="home-hsk-progress-fill"
                  style={{ width: `${hskLevelStatus.progressToNextLevel}%` }}
                />
              </div>
              <div className="home-hsk-progress-footer">
                <p className="home-hsk-progress-label">{hskProgressLabel}</p>
                {hskLevelStatus.nextLevel !== null && (
                  <button
                    type="button"
                    className="home-hsk-missing-button"
                    onClick={() => setIsMissingModalOpen(true)}
                  >
                    Missing characters
                  </button>
                )}
              </div>
            </div>
          </section>

          <div className="home-metrics">
            <div className="home-metric-card">
              <p className="home-metric-value">{recognizedCount}</p>
              <p className="home-metric-label">
                Characters you are able to recognize
              </p>
            </div>
            <div className="home-metric-card">
              <p className="home-metric-value">{writtingCount}</p>
              <p className="home-metric-label">Characters you can write</p>
            </div>
          </div>

          {motivationMessages.length > 0 && (
            <ul className="home-motivation-list">
              {motivationMessages.map((message) => (
                <li key={message} className="home-motivation-item">
                  <TrophyIcon className="home-motivation-icon" />
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          )}

          <MissingHskCharactersModal
            isOpen={isMissingModalOpen}
            level={hskLevelStatus.nextLevel}
            characters={hskLevelStatus.missingCharacters}
            onClose={() => setIsMissingModalOpen(false)}
          />
        </>
      )}
    </Page>
  );
}
