<script lang="ts">
  import logo from "./assets/svelte.png"
  import Counter from "./lib/Counter.svelte"

  let map: boolean[][] = Array(10)
    .fill(false)
    .map(() => Array(7).fill(false))
    .map((a) => [true, ...a, true])

  map[0] = map[0].map((_cell) => true)
  map[map.length - 1] = map[map.length - 1].map((_cell) => true)

  let players = [
    { x: 1, y: 2, direction: "right", color: "bg-lime-500" },
    { x: 5, y: 3, direction: "left", color: "bg-red-500" },
  ]
</script>

<main>
  <h1>That Paper Game</h1>

  <div class="board flex flex-col items-center">
    {#each map as row, rowIdx}
      <div class="flex">
        {#each row as cell, cellIdx}
          {@const player = players.filter(
            (p) => p.x === cellIdx && p.y === rowIdx
          )[0]}
          <span
            class={`h-12 w-12 border border-black ${cell ? "bg-gray-900" : ""}`}
          >
            {#if player}
              <div class={`w-full h-full ${player.color}`} />
            {/if}
          </span>
        {/each}
      </div>
    {/each}
  </div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
    width: 16rem;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4rem;
    line-height: 1.1;
    margin: 2rem auto;
    max-width: 14rem;
  }

  p {
    max-width: 14rem;
    margin: 1rem auto;
    line-height: 1.35;
  }

  @media (min-width: 480px) {
    h1 {
      max-width: none;
    }

    p {
      max-width: none;
    }
  }
</style>
