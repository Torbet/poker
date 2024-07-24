<script lang="ts">
	import { AspectRatio } from '$lib/components/ui/aspect-ratio';
	import { cn } from '$lib/utils';
	import { Spade, Heart, Club, Diamond } from 'lucide-svelte';

	export let empty: boolean = false;
	export let card: string = '2H';

	let [rank, suit] = card.split('');
	let suitIcon = suit === 's' ? Spade : suit === 'h' ? Heart : suit === 'c' ? Club : Diamond;
	let rankIcon = rank === 'T' ? 10 : rank;
	let color = suit === 's' || suit === 'c' ? 'text-black' : 'text-red-500';
</script>

{#if empty}
	<AspectRatio ratio={2 / 3} class="rounded-lg border-2 border-dashed md:border-4" />
{:else}
	<AspectRatio
		ratio={2 / 3}
		class={cn(
			'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 md:gap-8 md:border-4',
			color
		)}
	>
		<span class="text-3xl font-bold md:text-5xl">{rankIcon}</span>
		<svelte:component this={suitIcon} strokeWidth="3" class="h-10 w-10 md:h-14 md:w-14" />
	</AspectRatio>
{/if}
