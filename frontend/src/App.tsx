async function callBackend() {
  const response = await fetch("/hello", { method: "POST" });
  const message = await response.text();
  alert(message);
}

export default function App() {
  return (
    <main>
      <h1>Hello World</h1>
      <button type="button" onClick={() => void callBackend()}>
        Call backend
      </button>
    </main>
  );
}
