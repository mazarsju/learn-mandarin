import { useEffect, useMemo, useState } from "react";
import { TrophyIcon } from "../components/icons";
import Page from "../components/Page";
import type { Character } from "../types/character";
import { getMotivationMessages } from "../utils/homeMotivation";

async function fetchCharacters() {
  const response = await fetch("/characters", { method: "GET" });

  if (!response.ok) {
    throw new Error("Failed to load characters.");
  }

  return (await response.json()) as Character[];
}

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void fetchCharacters()
      .then((loadedCharacters) => {
        if (isMounted) {
          setCharacters(loadedCharacters);
        }
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load characters.",
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
  const motivationMessages = useMemo(
    () => getMotivationMessages(recognizedCount),
    [recognizedCount],
  );

  return (
    <Page title="Home">
      {isLoading && <p>Loading your progress...</p>}
      {error && <p className="table-error">{error}</p>}
      {!isLoading && !error && (
        <>
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
        </>
      )}
    </Page>
  );
}
