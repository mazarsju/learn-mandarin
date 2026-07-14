import { useCallback, useEffect, useState, type FormEvent } from "react";
import Page from "../components/Page";
import type { LlmConfig } from "../types/llmConfig";
import { fetchLlmConfig, saveLlmConfig } from "../utils/llmConfigApi";

const emptyLlmConfig: LlmConfig = {
  LLM_API_KEY: "",
  LLM_MODEL: "",
};

export default function PreferencesPage() {
  const [llmConfig, setLlmConfig] = useState<LlmConfig>(emptyLlmConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadLlmConfig = useCallback(async () => {
    setError(null);

    try {
      const config = await fetchLlmConfig();
      setLlmConfig(config);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load LLM configuration.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLlmConfig();
  }, [loadLlmConfig]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const savedConfig = await saveLlmConfig(llmConfig);
      setLlmConfig(savedConfig);
      setSaveMessage("LLM configuration saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save LLM configuration.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Page title="Preferences">
      <section className="preferences-section">
        <h2 className="preferences-section-title">LLM configuration</h2>
        <p className="preferences-section-description">
          Configure the API key and model used by the chat features.
        </p>

        {isLoading && <p>Loading LLM configuration...</p>}
        {error && <p className="table-error">{error}</p>}
        {saveMessage && <p className="preferences-save-message">{saveMessage}</p>}

        {!isLoading && (
          <form className="preferences-form" onSubmit={(event) => void handleSave(event)}>
            <label className="preferences-field">
              <span className="preferences-field-label">LLM API key</span>
              <input
                type="password"
                value={llmConfig.LLM_API_KEY}
                autoComplete="off"
                onChange={(event) =>
                  setLlmConfig((current) => ({
                    ...current,
                    LLM_API_KEY: event.target.value,
                  }))
                }
              />
            </label>
            <label className="preferences-field">
              <span className="preferences-field-label">LLM model</span>
              <input
                type="text"
                value={llmConfig.LLM_MODEL}
                placeholder="gpt-4o-mini"
                onChange={(event) =>
                  setLlmConfig((current) => ({
                    ...current,
                    LLM_MODEL: event.target.value,
                  }))
                }
              />
            </label>
            <button
              type="submit"
              className="page-add-button"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save LLM configuration"}
            </button>
          </form>
        )}
      </section>
    </Page>
  );
}
