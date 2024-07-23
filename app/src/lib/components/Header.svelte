<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Menu } from 'lucide-svelte';

	export let user: User | null;

	let open: boolean = false;
	afterNavigate(() => (open = false));
</script>

<header class="flex items-center justify-between p-4">
	<Button href="/" variant="ghost" class="text-xl font-bold">Poker</Button>
	<Sheet.Root bind:open>
		<Sheet.Trigger>
			<Button variant="ghost" size="icon">
				<Menu size="24" />
			</Button>
		</Sheet.Trigger>
		<Sheet.Content class="flex flex-col gap-4">
			{#if user}
				<div class="flex items-center gap-4">
					<Avatar.Root class="h-10 w-10">
						<Avatar.Image src={user.avatar} alt={user.username} />
						<Avatar.Fallback>{user.username[0].toUpperCase()}</Avatar.Fallback>
					</Avatar.Root>
					<div class="grid gap-1">
						<p class="text-sm font-medium leading-none">{user.username}</p>
						<p class="text-sm text-muted-foreground">{user.email}</p>
					</div>
					<div class="ml-auto font-medium">{user.chips}</div>
				</div>
			{:else}
				<Button href="login" variant="default">Login</Button>
				<Button href="signup" variant="secondary">Sign Up</Button>
			{/if}
			{#if user}
				<Button href="logout" variant="destructive" class="mt-auto">Logout</Button>
			{/if}
		</Sheet.Content>
	</Sheet.Root>
</header>
