<script lang="ts">
  let map: boolean[][] = Array(10)
    .fill(false)
    .map(() => Array(7).fill(false))
    .map((a) => [true, ...a, true])

  map[0] = map[0].map((_cell) => true)
  map[map.length - 1] = map[map.length - 1].map((_cell) => true)

  let players = [
    { x: 1, y: 2, direction: "right", color: "bg-lime-500" },
    { x: 5, y: 3, direction: "left", color: "bg-red-500" },
    { x: 4, y: 8, direction: "left", color: "bg-blue-500" },
  ]

  let currentPlayerIdx = 1

  $: if (currentPlayerIdx < 0) {
    currentPlayerIdx = 0
  }

  $: if (currentPlayerIdx > players.length - 1) {
    currentPlayerIdx = players.length - 1
  }

  $: mapWithPlayers = map.map((row, y) =>
    row.map((hole, x) => ({
      x,
      y,
      hole,
      player: players.find((player) => player.x === x && player.y === y),
    }))
  )

  function onUp() {
    const player = players[currentPlayerIdx]
    player.direction = "up"
    player.x = player.x
    player.y = player.y - 1
    players = players
  }

  function onLeft() {
    const player = players[currentPlayerIdx]
    player.direction = "left"
    player.x = player.x - 1
    player.y = player.y
    players = players
  }

  function onAtk() {
    const player = players[currentPlayerIdx]
  }

  function onRight() {
    const player = players[currentPlayerIdx]
    player.direction = "right"
    player.x = player.x + 1
    player.y = player.y
    players = players
  }

  function onDown() {
    const player = players[currentPlayerIdx]
    player.direction = "down"
    player.x = player.x
    player.y = player.y + 1
    players = players
  }
</script>

<main>
  <h1>That Paper Game</h1>

  <div class="board flex flex-col items-center">
    {#each mapWithPlayers as row, rowIdx}
      <div class="flex">
        {#each row as { x, y, hole, player }, cellIdx}
          <span
            class={`h-12 w-12 border border-black ${hole ? "bg-gray-900" : ""}`}
          >
            {#if player}
              <div class={`w-full h-full ${player.color}`} />
            {/if}
          </span>
        {/each}
      </div>
    {/each}
  </div>

  <div class="controls flex justify-center mt-12">
    <div class="flex flex-col">
      <div class="flex">
        <span class="w-16 h-16" />
        <button
          on:click={onUp}
          class="w-16 h-16 border rounded flex items-center justify-center"
          >Up</button
        >
        <span class="w-16 h-16" />
      </div>
      <div class="flex">
        <button
          on:click={onLeft}
          class="w-16 h-16 border rounded flex items-center justify-center"
          >Left</button
        >
        <button
          on:click={onAtk}
          class="w-16 h-16 border rounded flex items-center justify-center"
          >Atk</button
        >
        <button
          on:click={onRight}
          class="w-16 h-16 border rounded flex items-center justify-center"
          >Right</button
        >
      </div>
      <div class="flex">
        <span class="w-16 h-16" />
        <button
          on:click={onDown}
          class="w-16 h-16 border rounded flex items-center justify-center"
          >Down</button
        >
        <span class="w-16 h-16" />
      </div>
    </div>
  </div>

  <div class="players flex justify-center mt-8">
    <input type="number" bind:value={currentPlayerIdx} />
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
