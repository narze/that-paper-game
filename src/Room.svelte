<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import {
    svelteStore,
    synced,
    peers,
    connected,
    connectRoom,
    GameState,
  } from "./lib/synced-store"
  import url from "./lib/url"

  import { player } from "./lib/player-store"
  import WaitingRoom from "./WaitingRoom.svelte"
  import PrepareMap from "./PrepareMap.svelte"

  export let roomId = ""
  export let createRoom: boolean

  const webrtcProvider = connectRoom(roomId)

  $: gameState = $svelteStore.gameData.state || GameState.Waiting

  const playerId = $player.id

  // $: roomPlayers = Object.values($svelteStore.roomPlayers)

  let enteredRoom = false

  function enter() {
    enteredRoom = true

    $svelteStore.roomPlayers[playerId] = {
      id: playerId,
      name: $player.name,
      ready: false,
      admin: false,
      enteredAt: new Date().getTime(),
    }

    window.location.hash = `#/rooms/${roomId}`
  }

  $: if ($connected && createRoom && !enteredRoom) {
    // console.log("Auto enter room (creator)")
    enter()
  }

  $: if ($connected && !createRoom && $synced && !enteredRoom) {
    // console.log("Auto enter room (joiners)")
    enter()
  }

  function nextState() {
    $svelteStore.gameData.state =
      (gameState + 1) % Object.keys(GameState).length
  }

  // TODO: Move to Game Component
  const directions = {
    up: "🔼",
    right: "▶️",
    down: "🔽",
    left: "◀️",
  }

  let map: boolean[][] = Array(8)
    .fill(false)
    .map(() => Array(5).fill(false))
    .map((a) => [true, ...a, true])

  map[0] = map[0].map((_cell) => true)
  map[map.length - 1] = map[map.length - 1].map((_cell) => true)

  let players = [
    { x: 2, y: 2, direction: "right", color: "bg-lime-500", name: "A", hp: 5 },
    { x: 3, y: 5, direction: "left", color: "bg-red-500", name: "B", hp: 5 },
    { x: 4, y: 3, direction: "left", color: "bg-blue-500", name: "C", hp: 5 },
  ]

  $: players = $svelteStore.players || players

  let currentPlayerIdx = 0
  let maxDistance = 0
  let distance = 0
  let rolled = false
  let currentPlayerBeforeMove
  let gameEnded = false

  $: if (players.filter((p) => p.hp > 0).length === 1) {
    const winner = players.filter((p) => p.hp > 0)[0]
    // alert(`${winner.name} won!`)
    gameEnded = true
  }

  $: if (currentPlayerIdx < 0) {
    currentPlayerIdx = 0
  }

  $: if (currentPlayerIdx > players.length - 1) {
    currentPlayerIdx = players.length - 1
  }

  $: currentPlayer = players[currentPlayerIdx]

  $: mapWithPlayers = map.map((row, y) =>
    row.map((hole, x) => ({
      x,
      y,
      hole,
      player: players.find(
        (player) => player.x === x && player.y === y && player.hp > 0
      ),
    }))
  )

  $: isDead = currentPlayer && currentPlayer.hp <= 0
  $: if (isDead) {
    endTurn()
  }

  $: attackable = rolled && distance == maxDistance
  $: canWalk = {
    up: rolled && walkable(currentPlayer.x, currentPlayer.y - 1),
    down: rolled && walkable(currentPlayer.x, currentPlayer.y + 1),
    left: rolled && walkable(currentPlayer.x - 1, currentPlayer.y),
    right: rolled && walkable(currentPlayer.x + 1, currentPlayer.y),
  }

  function onUp() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y - 1)) {
      return
    }
    player.direction = "up"
    player.y = player.y - 1
    distance += 1
    players = players
  }

  function onLeft() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x - 1, player.y)) {
      return
    }
    player.direction = "left"
    player.x = player.x - 1
    distance += 1
    players = players
  }

  function onRight() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x + 1, player.y)) {
      return
    }
    player.direction = "right"
    player.x = player.x + 1
    distance += 1
    players = players
  }

  function onDown() {
    const player = players[currentPlayerIdx]
    if (!walkable(player.x, player.y + 1)) {
      return
    }
    player.direction = "down"
    player.y = player.y + 1
    distance += 1
    players = players
  }

  function onAtk() {
    if (!attackable) {
      return
    }

    const player = players[currentPlayerIdx]
    let targetIdx

    switch (player.direction) {
      case "up":
        targetIdx = players.findIndex(
          (p) => p.x === player.x && p.y === player.y - 1
        )
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1
          players[targetIdx].y -= 1
          checkPlayerInHole(targetIdx)
          players = players
        }
        break
      case "right":
        targetIdx = players.findIndex(
          (p) => p.x === player.x + 1 && p.y === player.y
        )
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1
          players[targetIdx].x += 1
          checkPlayerInHole(targetIdx)
          players = players
        }
        break
      case "down":
        targetIdx = players.findIndex(
          (p) => p.x === player.x && p.y === player.y + 1
        )
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1
          players[targetIdx].y += 1
          checkPlayerInHole(targetIdx)
          players = players
        }
        break
      case "left":
        targetIdx = players.findIndex(
          (p) => p.x === player.x - 1 && p.y === player.y
        )
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1
          players[targetIdx].x -= 1
          checkPlayerInHole(targetIdx)
          players = players
        }
        break
    }

    endTurn()
  }

  function checkPlayerInHole(playerIdx) {
    const player = players[playerIdx]

    if (map[player.y]?.[player.x] == true) {
      players[playerIdx].hp = 0
    }
  }

  function walkable(x, y) {
    if (distance >= maxDistance) return false
    if (mapWithPlayers[y]?.[x].hole) return false
    if (mapWithPlayers[y]?.[x].player) return false

    return true
  }

  function rollDice() {
    currentPlayerBeforeMove = { ...currentPlayer }
    maxDistance = ~~(Math.random() * 6) + 1
    rolled = true
  }

  function resetWalk() {
    players[currentPlayerIdx] = { ...currentPlayerBeforeMove }
    distance = 0
    players = players
  }

  function endTurn() {
    currentPlayerIdx = (currentPlayerIdx + 1) % players.length
    rolled = false
    distance = 0
    maxDistance = 0
  }

  function restartGame() {
    currentPlayerIdx = 0
    rolled = false
    distance = 0
    maxDistance = 0
    players = players.map((p) => ({ ...p, hp: 5 }))
    gameEnded = false
  }
</script>

<main>
  <h1>That Paper Game</h1>

  <p>Room ID: {roomId}</p>

  <!-- <pre class="text-left">
    $svelteStore : {JSON.stringify($svelteStore, null, 2)}
  playerIds count : {Object.keys($svelteStore.roomPlayers).length}
  player: {JSON.stringify(player)}
  roomPlayers: {JSON.stringify($svelteStore.roomPlayers, null, 2)}
  </pre> -->
  {#if !$connected || !enteredRoom}
    <div>Loading...</div>
    <!-- {:else if !enteredRoom} -->
    <!-- <button
      class="btn"
      on:click={enter}
      disabled={createRoom ? !$connected : !$synced}>Enter</button
    > -->
  {:else}
    {#if gameState == GameState.Waiting}
      <WaitingRoom store={svelteStore} {nextState} />
    {:else if gameState == GameState.Prepare}
      <PrepareMap store={svelteStore} {nextState} />
    {:else if gameState == GameState.Start}
      TODO: Start the game...
    {:else if gameState == GameState.Ended}
      TODO: Show the result of the game...
    {/if}

    <!-- {JSON.stringify(currentPlayerBeforeMove)} -->
    <div class="board flex flex-col items-center mt-16">
      {#each mapWithPlayers as row, rowIdx}
        <div class="flex">
          {#each row as { x, y, hole, player }, cellIdx}
            <span
              class={`h-12 w-12 border border-black ${
                hole ? "bg-gray-900" : ""
              }`}
            >
              {#if player}
                <div
                  class={`w-full h-full ${player.color} flex items-center justify-center text-3xl`}
                >
                  {directions[player.direction]}
                </div>
              {/if}
            </span>
          {/each}
        </div>
      {/each}
    </div>

    <div class="controls flex justify-center mt-12">
      <div class="players">
        {#each players as player, idx}
          <div
            class={`px-3 py-1 mt-1 text-left ${player.color} ${
              player.hp <= 0 ? "line-through" : ""
            }`}
          >
            {player.name}
            {player.hp}
            {currentPlayerIdx == idx ? "*" : ""}
          </div>
        {/each}
      </div>

      <div class="flex flex-col ml-12">
        <div class="flex">
          <span class="w-16 h-16" />
          <button
            on:click={onUp}
            disabled={!canWalk["up"]}
            class={`btn w-16 h-16 border rounded flex items-center justify-center`}
            >Up</button
          >
          <span class="w-16 h-16" />
        </div>
        <div class="flex">
          <button
            on:click={onLeft}
            disabled={!canWalk["left"]}
            class={`btn w-16 h-16 border rounded flex items-center justify-center`}
            >Left</button
          >
          <button
            on:click={onAtk}
            disabled={!attackable}
            class={`btn w-16 h-16 border rounded flex items-center justify-center ${
              !attackable ? "btn-disabled" : ""
            }`}>Atk</button
          >
          <button
            on:click={onRight}
            disabled={!canWalk["right"]}
            class={`btn w-16 h-16 border rounded flex items-center justify-center`}
            >Right</button
          >
        </div>
        <div class="flex">
          <span class="w-16 h-16" />
          <button
            on:click={onDown}
            disabled={!canWalk["down"]}
            class={`btn w-16 h-16 border rounded flex items-center justify-center`}
            >Down</button
          >
          <span class="w-16 h-16" />
        </div>
      </div>

      <div class="ml-8 flex flex-col">
        <button on:click={rollDice} disabled={rolled} class="btn">Roll</button>
        <button on:click={resetWalk} disabled={!rolled} class="btn"
          >Reset</button
        >

        {#if rolled}
          <div class="mt-4 text-xl">{distance}/{maxDistance ?? ""}</div>
        {/if}
      </div>
    </div>

    {#if gameEnded}
      <div class="flex justify-center mt-8">
        <button class="btn" on:click={restartGame}>Restart</button>
      </div>
    {/if}
  {/if}
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
