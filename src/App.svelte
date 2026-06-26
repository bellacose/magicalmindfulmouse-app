<script>
  import Header from './lib/Header.svelte';
  import FilterBar from './lib/FilterBar.svelte';
  import RestaurantList from './lib/RestaurantList.svelte';
  import RestaurantDetail from './lib/RestaurantDetail.svelte';
  import ChefCard from './lib/ChefCard.svelte';
  import EmergencyScreen from './lib/EmergencyScreen.svelte';
  import { view } from './stores/filters.js';

  $: route = $view;
</script>

<Header />

<main>
  {#if route.name === 'list'}
    <FilterBar />
    <RestaurantList />
  {:else if route.name === 'detail'}
    <RestaurantDetail params={route.params} />
  {:else if route.name === 'chef-card'}
    <ChefCard params={route.params} />
  {:else if route.name === 'emergency'}
    <EmergencyScreen />
  {:else}
    <FilterBar />
    <RestaurantList />
  {/if}
</main>

<style>
  main {
    flex: 1;
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: 16px;
    padding-bottom: 80px;
  }
</style>