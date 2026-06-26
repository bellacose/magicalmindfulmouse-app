<script>
  import { view } from '../stores/filters.js';

  function go(name, params = {}) {
    view.set({ name, params });
  }
</script>

<header>
  <button class="brand" on:click={() => go('list')} aria-label="Home">
    <span class="logo">🐭</span>
    <span class="title">MindfulMouse</span>
  </button>
  <nav>
    <button class="nav-btn" on:click={() => go('chef-card')} aria-label="Chef card">
      <span aria-hidden="true">📋</span>
      <span class="nav-label">Chef Card</span>
    </button>
    <button class="nav-btn emergency" on:click={() => go('emergency')} aria-label="Emergency info">
      <span aria-hidden="true">🚨</span>
      <span class="nav-label">Emergency</span>
    </button>
  </nav>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bg-elev);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 18px;
  }
  .logo { font-size: 24px; }
  nav {
    display: flex;
    gap: 4px;
  }
  .nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    font-size: 11px;
    color: var(--text-dim);
  }
  .nav-btn:active { background: var(--bg-elev2); }
  .nav-btn.emergency { color: var(--danger); }
  .nav-btn span:first-child { font-size: 18px; }
</style>