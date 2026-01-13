export default function App() {
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Racha</h1>
      <p>App principal</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
