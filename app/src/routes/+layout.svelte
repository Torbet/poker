<script lang="ts">
	import type { LayoutServerData } from './$types';
	import '$lib/app.css';
	import Header from '$lib/components/Header.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	export let data: LayoutServerData;
	$: user = data.user;
</script>

<Header {user} />

<main class="container flex grow flex-col">
	<slot />
</main>

<Toaster />
