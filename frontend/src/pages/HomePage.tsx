import Page from "../components/Page";

async function callBackend() {
  const response = await fetch("/hello", { method: "POST" });
  const message = await response.text();
  alert(message);
}

export default function HomePage() {
  return (
    <Page title="Home">
      <p>Welcome to Learn Mandarin.</p>
      <button type="button" onClick={() => void callBackend()}>
        Call backend
      </button>
    </Page>
  );
}
