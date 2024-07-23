<script lang="ts">
	import type { ActionData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Alert from '$lib/components/ui/alert';
	import { CircleAlert } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	export let form: ActionData;
</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<Card.Root class="m-auto w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl">Sign Up</Card.Title>
		<Card.Description>Create an account and start playing.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="post" use:enhance class="grid gap-4">
			<div class="grid gap-2">
				<Label for="username">Username</Label>
				<Input name="username" type="text" placeholder="john" required />
			</div>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input name="email" type="email" placeholder="john@example.com" required />
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input name="password" type="password" required />
			</div>
			<div class="grid gap-2">
				<Label for="Confirm Password">Confirm Password</Label>
				<Input name="confirmPassword" type="password" required />
			</div>

			{#if form?.message}
				<Alert.Root variant="destructive">
					<CircleAlert size="24" />
					<Alert.Title>Error</Alert.Title>
					<Alert.Description>{form.message}</Alert.Description>
				</Alert.Root>
			{/if}

			<Button type="submit" class="w-full">Sign Up</Button>
		</form>
		<div class="mt-4 text-center text-sm">
			Already have an account? <a href="/login" class="underline">Login</a>
		</div>
	</Card.Content>
</Card.Root>
