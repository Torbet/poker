<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Socket } from '$lib/socket';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let inQueue: boolean = false;
	let socket: Socket;
	onMount(() => {
		socket = new Socket('ws://192.168.0.79:3000');

		socket.on('start', (id: string) => {
			goto(`/game/${id}`);
		});
	});

	const play = (amount: number) => {
		socket.emit('join', amount);
		inQueue = true;
	};
</script>

<svelte:head>
	<title>Play</title>
</svelte:head>

<Card.Root class="m-auto w-full max-w-xl">
	<Card.Header>
		<Card.Title>Play Poker</Card.Title>
		<Card.Description>Select a buy in amound and start playing!</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if inQueue}
			<Button disabled>Joining Game...</Button>
		{:else}
			<Button on:click={() => play(100)}>100</Button>
			<Button on:click={() => play(1000)}>1000</Button>
			<Button on:click={() => play(10000)}>10,000</Button>
		{/if}
	</Card.Content>
</Card.Root>
