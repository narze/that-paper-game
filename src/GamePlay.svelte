<script lang="ts">
  import type { svelteSyncedStore } from "@syncedstore/svelte";

  import { onMount, onDestroy } from "svelte";
  import type { GamePlayer, svelteStore } from "./lib/synced-store";
  import { player } from "./lib/player-store";

  export let store: typeof svelteStore;
  export let nextState: () => void;
  let currentPlayerBeforeMove: GamePlayer;

  const playerId = $player.id;
  $: players = $store.players;
  $: currentPlayerIdx = $store.gameData.currentPlayerIdx || 0;
  $: maxDistance = $store.gameData.maxDistance || 0;
  $: distance = $store.gameData.distance || 0;
  $: rolled = $store.gameData.rolled || false;
  $: currentPlayerBeforeMove = $store.gameData.currentPlayerBeforeMove || {};
  $: gameEnded = $store.gameData.gameEnded || false;
  $: isMyTurn = players[currentPlayerIdx].id === playerId;
  $: currentPlayer = players[currentPlayerIdx];

  const directions = {
    up: "🔼",
    right: "▶️",
    down: "🔽",
    left: "◀️",
  };

  let map: boolean[][] = Array(8)
    .fill(false)
    .map(() => Array(5).fill(false))
    .map((a) => [true, ...a, true]);

  map[0] = map[0].map((_cell) => true);
  map[map.length - 1] = map[map.length - 1].map((_cell) => true);

  $: mapWithPlayers = map.map((row, y) =>
    row.map((hole, x) => ({
      x,
      y,
      hole,
      player: players.find(
        (player) => player.x === x && player.y === y && player.hp > 0
      ),
    }))
  );

  $: isDead = currentPlayer && currentPlayer.hp <= 0;
  $: if (isDead && !gameEnded) {
    endTurn();
  }

  $: attackable = isMyTurn && rolled && distance == maxDistance;
  $: canWalk = {
    up:
      isMyTurn &&
      rolled &&
      walkable(currentPlayer.x, currentPlayer.y - 1, "up"),
    down:
      isMyTurn &&
      rolled &&
      walkable(currentPlayer.x, currentPlayer.y + 1, "down"),
    left:
      isMyTurn &&
      rolled &&
      walkable(currentPlayer.x - 1, currentPlayer.y, "left"),
    right:
      isMyTurn &&
      rolled &&
      walkable(currentPlayer.x + 1, currentPlayer.y, "right"),
  };

  function onUp() {
    const player = players[currentPlayerIdx];
    if (!walkable(player.x, player.y - 1)) {
      return;
    }
    $store.players[currentPlayerIdx].direction = "up";
    $store.players[currentPlayerIdx].y = player.y - 1;
    $store.gameData.distance = distance + 1;
  }

  function onLeft() {
    const player = players[currentPlayerIdx];
    if (!walkable(player.x - 1, player.y)) {
      return;
    }
    $store.players[currentPlayerIdx].direction = "left";
    $store.players[currentPlayerIdx].x = player.x - 1;
    $store.gameData.distance = distance + 1;
  }

  function onRight() {
    const player = players[currentPlayerIdx];
    if (!walkable(player.x + 1, player.y)) {
      return;
    }
    $store.players[currentPlayerIdx].direction = "right";
    $store.players[currentPlayerIdx].x = player.x + 1;
    $store.gameData.distance = distance + 1;
  }

  function onDown() {
    const player = players[currentPlayerIdx];
    if (!walkable(player.x, player.y + 1)) {
      return;
    }
    $store.players[currentPlayerIdx].direction = "down";
    $store.players[currentPlayerIdx].y = player.y + 1;
    $store.gameData.distance = distance + 1;
  }

  function onAtk() {
    if (!attackable) {
      return;
    }

    const player = players[currentPlayerIdx];
    let targetIdx;

    switch (player.direction) {
      case "up":
        targetIdx = players.findIndex(
          (p) => p.x === player.x && p.y === player.y - 1
        );
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1;
          players[targetIdx].y -= 1;
          checkPlayerInHole(targetIdx);
        }
        break;
      case "right":
        targetIdx = players.findIndex(
          (p) => p.x === player.x + 1 && p.y === player.y
        );
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1;
          players[targetIdx].x += 1;
          checkPlayerInHole(targetIdx);
        }
        break;
      case "down":
        targetIdx = players.findIndex(
          (p) => p.x === player.x && p.y === player.y + 1
        );
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1;
          players[targetIdx].y += 1;
          checkPlayerInHole(targetIdx);
        }
        break;
      case "left":
        targetIdx = players.findIndex(
          (p) => p.x === player.x - 1 && p.y === player.y
        );
        if (targetIdx != -1) {
          players[targetIdx].hp -= 1;
          players[targetIdx].x -= 1;
          checkPlayerInHole(targetIdx);
        }
        break;
    }

    endTurn();
  }

  function checkPlayerInHole(playerIdx) {
    const player = players[playerIdx];

    if (map[player.y]?.[player.x] == true) {
      $store.players[playerIdx].hp = 0;
    }
  }

  function walkable(x, y, direction = "none") {
    const directionOpposite = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    if (distance >= maxDistance) return false;
    if (distance > 0 && currentPlayer.direction == directionOpposite[direction])
      return false;
    if (mapWithPlayers[y]?.[x].hole) return false;
    if (mapWithPlayers[y]?.[x].player) return false;

    return true;
  }

  function rollDice() {
    $store.gameData.currentPlayerBeforeMove = { ...currentPlayer };
    $store.gameData.maxDistance = ~~(Math.random() * 6) + 1;
    $store.gameData.rolled = true;
  }

  function resetWalk() {
    $store.players[currentPlayerIdx].x = currentPlayerBeforeMove.x;
    $store.players[currentPlayerIdx].y = currentPlayerBeforeMove.y;
    $store.players[currentPlayerIdx].direction =
      currentPlayerBeforeMove.direction;
    $store.gameData.distance = 0;
  }

  function endTurn() {
    checkWinner();
    $store.gameData.currentPlayerIdx = (currentPlayerIdx + 1) % players.length;
    $store.gameData.rolled = false;
    $store.gameData.distance = 0;
    $store.gameData.maxDistance = 0;
  }

  function restartGame() {
    $store.gameData.currentPlayerIdx = 0;
    $store.gameData.rolled = false;
    $store.gameData.distance = 0;
    $store.gameData.maxDistance = 0;
    $store.players.forEach((p) => {
      delete p.x;
      delete p.y;
      delete p.direction;
      delete p.hp;
    });
    $store.gameData.gameEnded = false;

    nextState();
  }

  function checkWinner() {
    if (players.filter((p) => p.hp > 0).length === 1) {
      const winner = players.filter((p) => p.hp > 0)[0];
      alert(`${winner.name} won!`);
      $store.gameData.gameEnded = true;
    }
  }
</script>

<div class="flex flex-row gap-12 justify-between">
  <div class="flex flex-col gap-6 border-r-2 border-blue-500 pr-12">
    <h1 class="text-6xl font-bold font-ubuntu text-blue-500">Players</h1>
    <div class="flex flex-col gap-2">
      {#each players as player, idx}
        <div class={`font-prompt ${player.color} p-1 rounded-lg`}>
          <p class="text-left">
            #{idx + 1}: {currentPlayerIdx === idx ? "🎮 " : ""}{player.name}
            {player.id === playerId ? "(Me)" : ""}
            {"💖".repeat(Number(player.hp))}
          </p>
        </div>
      {/each}
    </div>
    {#if gameEnded}
      <div class="flex justify-center gap-2">
        <button class="btn" on:click={restartGame}>Restart</button>
        <button class="btn btn-error" on:click={() => (location.href = "/")}
          >Back</button
        >
      </div>
    {/if}
  </div>
  <!-- {JSON.stringify(currentPlayerBeforeMove)} -->
  <div class="flex flex-row items-center gap-6">
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
      {#if isMyTurn}
        <div
          class="text-lg mt-8 w-full font-ubuntu font-bold bg-green-500 inline-block p-1 rounded-lg text-white"
        >
          It's Your Turn!
        </div>
      {/if}
      {#if !isMyTurn}
        <div
          class="text-lg mt-8 w-full font-ubuntu font-bold bg-red-500 inline-block p-1 rounded-lg text-white"
        >
          Waiting for other players...
        </div>
      {/if}
    </div>

    <div class="controls flex flex-row gap-8 justify-center">
      <div class="flex flex-col gap-2">
        <div class="flex flex gap-2">
          <span class="w-16 h-16" />
          <button
            on:click={onUp}
            disabled={!canWalk["up"]}
            class={`btn w-16 h-16 border rounded flex items-center justify-center`}
            >Up</button
          >
          <span class="w-16 h-16" />
        </div>
        <div class="flex gap-2">
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
        <div class="flex gap-2">
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

      <div class="flex flex-col gap-2">
        <button
          on:click={rollDice}
          disabled={gameEnded || !isMyTurn || rolled}
          class="btn">Roll</button
        >
        <button on:click={resetWalk} disabled={!isMyTurn || !rolled} class="btn"
          >Reset</button
        >

        {#if rolled}
          <div class="mt-4 text-xl">{distance}/{maxDistance ?? ""}</div>
        {/if}
      </div>
    </div>
  </div>
</div>
