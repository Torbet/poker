<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import * as Avatar from '$lib/components/ui/avatar';
	import { onMount } from 'svelte';
	import PlayingCard from '$lib/components/PlayingCard.svelte';
	import { Socket } from '$lib/socket';
	import { page } from '$app/stores';
	import { formatDate, capitalize } from '$lib/utils';

	const id = $page.params.id;

	interface State {
		opponent: {
			username: string;
			avatar: string;
			chips: number;
			createdAt: Date;
		};
		pot: number;
		hand: string[];
		communityCards: string[];
		turn: boolean;
		lastAction: { action: string; amount: number | null } | null;
		evaluation: string;
	}

	let state: State = {
		opponent: {
			username: 'Opponent',
			avatar: '',
			chips: 0,
			createdAt: new Date()
		},
		pot: 0,
		hand: [],
		communityCards: [],
		turn: false,
		lastAction: null,
		evaluation: ''
	};

	$: ({ turn, opponent, pot, hand, communityCards, lastAction, evaluation } = state);

	let betAmount: number[] = [0];

	let socket: Socket;
	let showSlider: boolean = false;

	const bet = () => {
		if (!showSlider) {
			showSlider = true;
			return;
		}
		showSlider = false;
		socket.emit('bet', betAmount[0]);
	};
	const raise = () => {
		if (!showSlider) {
			showSlider = true;
			return;
		}
		showSlider = false;
		socket.emit('raise', betAmount[0]);
	};
	const call = () => {
		socket.emit('call');
	};
	const check = () => {
		socket.emit('check');
	};
	const fold = () => {
		socket.emit('fold');
	};

	onMount(() => {
		socket = new Socket(`ws://192.168.0.79:3000?id=${id}`);

		socket.on('state', (data: State) => {
			state = data;
			betAmount = [0];
			showSlider = false;
		});

		socket.on('error', (error: string) => {
			alert(error);
		});
	});
</script>

<svelte:head>
	<title>Game Against {opponent.username}</title>
</svelte:head>

<div class="mx-auto mb-4 flex w-full max-w-4xl grow flex-col justify-between gap-6">
	<div class="flex items-center gap-4">
		<Avatar.Root class="h-10 w-10">
			<Avatar.Image src={opponent.avatar} alt={null} />
			<Avatar.Fallback>{opponent.username[0].toUpperCase()}</Avatar.Fallback>
		</Avatar.Root>
		<div class="grid gap-1">
			<p class="text-sm font-medium leading-none">{opponent.username}</p>
			<p class="text-sm text-muted-foreground">{formatDate(opponent.createdAt)}</p>
		</div>
		<div class="ml-auto font-semibold">{opponent.chips}</div>
	</div>

	<div class="grid grid-cols-5 gap-2 md:gap-6">
		{#each [0, 1, 2, 3, 4] as i}
			{#if communityCards[i]}
				<PlayingCard card={communityCards[i]} />
			{:else}
				<PlayingCard empty />
			{/if}
		{/each}
	</div>

	<div class="mx-auto flex flex-col items-center text-2xl">
		<span class="text-muted-foreground">Pot</span>
		<span class="text-4xl font-bold">{pot}</span>
		{#if lastAction}
			<span class="text-sm text-muted-foreground">
				{capitalize(lastAction.action)}
				{lastAction.amount || ''}
			</span>
		{/if}
	</div>

	<div class="grid grid-cols-4 gap-2 md:gap-6">
		<span></span>
		{#each hand as card}
			<PlayingCard {card} />
		{/each}
		<span></span>
	</div>

	<span class="mx-auto text-sm text-muted-foreground">{evaluation}</span>

	<div class="flex flex-col gap-6">
		{#if showSlider}
			<Slider bind:value={betAmount} />
		{/if}
		<div class="grid grid-cols-2 gap-4">
			{#if lastAction && (lastAction.action === 'bet' || lastAction.action === 'raise')}
				<Button variant="outline" disabled={!turn} on:click={raise}
					>Raise {#if showSlider}({betAmount}){/if}</Button
				>
				<Button variant="outline" disabled={!turn} on:click={call}
					>Call ({lastAction.amount})</Button
				>
			{:else}
				<Button variant="outline" disabled={!turn} on:click={bet}
					>Bet {#if showSlider}({betAmount}){/if}</Button
				>
				<Button variant="outline" disabled={!turn} on:click={check}>Check</Button>
			{/if}
			<Button variant="destructive" disabled={!turn} on:click={fold} class="col-span-2">Fold</Button
			>
		</div>
	</div>
</div>
