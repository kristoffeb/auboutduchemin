<script lang="ts">
	import { onDestroy } from 'svelte';

	export let artistNameString: string;
	export let songTitleString: string;
	export let mp3UrlString: string;

	let audioElementReference: HTMLAudioElement | null = null;

	let isAudioPlayingBoolean = false;
	let isAudioLoadingBoolean = false;
	let hasAudioErrorBoolean = false;

	let audioDurationSecondsNumber = 0;
	let audioCurrentTimeSecondsNumber = 0;

	let progressPercentageNumber = 0;

	let progressAnimationFrameIdNumber: number | null = null;

	let timelineContainerElementReference: HTMLDivElement | null = null;

	function updateProgressValuesFromAudioElement() {
		if (!audioElementReference) return;

		const durationValue = Number(audioElementReference.duration);
		const currentTimeValue = Number(audioElementReference.currentTime);

		audioDurationSecondsNumber = Number.isFinite(durationValue) ? durationValue : 0;
		audioCurrentTimeSecondsNumber = Number.isFinite(currentTimeValue) ? currentTimeValue : 0;

		if (audioDurationSecondsNumber > 0) {
			progressPercentageNumber = Math.min(
				100,
				Math.max(0, (audioCurrentTimeSecondsNumber / audioDurationSecondsNumber) * 100)
			);
		} else {
			progressPercentageNumber = 0;
		}
	}

	function startProgressAnimationLoop() {
		stopProgressAnimationLoop();

		const animationStep = () => {
			updateProgressValuesFromAudioElement();

			if (isAudioPlayingBoolean) {
				progressAnimationFrameIdNumber = requestAnimationFrame(animationStep);
			} else {
				progressAnimationFrameIdNumber = null;
			}
		};

		progressAnimationFrameIdNumber = requestAnimationFrame(animationStep);
	}

	function stopProgressAnimationLoop() {
		if (progressAnimationFrameIdNumber !== null) {
			cancelAnimationFrame(progressAnimationFrameIdNumber);
			progressAnimationFrameIdNumber = null;
		}
	}

	function stopAndResetAudio() {
		if (!audioElementReference) return;

		audioElementReference.pause();
		audioElementReference.currentTime = 0;

		isAudioPlayingBoolean = false;
		isAudioLoadingBoolean = false;

		audioDurationSecondsNumber = 0;
		audioCurrentTimeSecondsNumber = 0;
		progressPercentageNumber = 0;

		stopProgressAnimationLoop();
	}

	function ensureAudioElementExistsAndHasListeners() {
		if (audioElementReference) return;

		audioElementReference = new Audio(mp3UrlString);
		audioElementReference.preload = 'metadata';

		audioElementReference.addEventListener('loadedmetadata', () => {
			updateProgressValuesFromAudioElement();
		});

		audioElementReference.addEventListener('timeupdate', () => {
			updateProgressValuesFromAudioElement();
		});

		audioElementReference.addEventListener('playing', () => {
			isAudioPlayingBoolean = true;
			isAudioLoadingBoolean = false;
			startProgressAnimationLoop();
		});

		audioElementReference.addEventListener('pause', () => {
			isAudioPlayingBoolean = false;
			isAudioLoadingBoolean = false;
			stopProgressAnimationLoop();
			updateProgressValuesFromAudioElement();
		});

		audioElementReference.addEventListener('waiting', () => {
			isAudioLoadingBoolean = true;
		});

		audioElementReference.addEventListener('ended', () => {
			isAudioPlayingBoolean = false;
			isAudioLoadingBoolean = false;
			stopProgressAnimationLoop();

			if (audioElementReference) audioElementReference.currentTime = 0;

			updateProgressValuesFromAudioElement();
		});

		audioElementReference.addEventListener('error', () => {
			hasAudioErrorBoolean = true;
			isAudioPlayingBoolean = false;
			isAudioLoadingBoolean = false;
			stopProgressAnimationLoop();
			updateProgressValuesFromAudioElement();
		});
	}

	function togglePlayback() {
		hasAudioErrorBoolean = false;

		ensureAudioElementExistsAndHasListeners();

		if (!audioElementReference) return;

		if (isAudioPlayingBoolean) {
			audioElementReference.pause();
			return;
		}

		isAudioLoadingBoolean = true;

		audioElementReference.play().catch(() => {
			hasAudioErrorBoolean = true;
			isAudioLoadingBoolean = false;
			isAudioPlayingBoolean = false;
			stopProgressAnimationLoop();
		});
	}

	function seekToMouseEvent(eventObject: MouseEvent) {
		if (!audioElementReference) return;
		if (!timelineContainerElementReference) return;

		// Ensure metadata is loaded so duration exists
		if (!Number.isFinite(audioElementReference.duration) || audioElementReference.duration <= 0)
			return;

		const timelineRect = timelineContainerElementReference.getBoundingClientRect();
		const clickX = eventObject.clientX;

		const rawClickRatio = (clickX - timelineRect.left) / timelineRect.width;
		const clampedClickRatio = Math.min(1, Math.max(0, rawClickRatio));

		const newTimeSeconds = clampedClickRatio * audioElementReference.duration;
		audioElementReference.currentTime = newTimeSeconds;

		updateProgressValuesFromAudioElement();
	}

	onDestroy(() => {
		stopAndResetAudio();
		audioElementReference = null;
	});
</script>

<div class="trackRow" style={`--progressPercentage: ${progressPercentageNumber}%;`}>
	<div class="trackText">
		<span class="trackArtist">{artistNameString}</span>
		<span class="trackDash"> - </span>
		<span class="trackSong">{songTitleString}</span>
	</div>

	<button
		class="playButton"
		type="button"
		on:click={togglePlayback}
		aria-label={isAudioPlayingBoolean ? 'Pause track' : 'Play track'}
	>
		{#if isAudioLoadingBoolean}
			…
		{:else if isAudioPlayingBoolean}
			❚❚
		{:else}
			▶
		{/if}
	</button>

	<!-- Seekable timeline (bottom border) -->
	<div
		class="timelineClickArea"
		bind:this={timelineContainerElementReference}
		role="slider"
		aria-label="Seek audio"
		aria-valuemin="0"
		aria-valuemax={audioDurationSecondsNumber}
		aria-valuenow={audioCurrentTimeSecondsNumber}
		tabindex="0"
		on:click={seekToMouseEvent}
	>
		<div class="timelineBase" aria-hidden="true"></div>
		<div class="timelineProgress" aria-hidden="true"></div>
	</div>
</div>

{#if hasAudioErrorBoolean}
	<p class="trackErrorText">Couldn’t play this audio file.</p>
{/if}

<style>
	.trackRow {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;

		padding: 14px 14px 18px;
		border-radius: 12px;
		border: 1px solid rgba(0, 0, 0, 0.08);
		background: rgba(0, 0, 0, 0.02);

		--progressPercentage: 0%;
	}

	.trackText {
		font-family:
			system-ui,
			-apple-system,
			Segoe UI,
			Roboto,
			Arial,
			sans-serif;
		font-weight: 700;
		letter-spacing: 0.01em;
		color: #1f3f16;

		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.playButton {
		width: 44px;
		height: 44px;
		border-radius: 999px;
		border: 0;
		cursor: pointer;
		background: #3b6d2a;
		color: white;
		font-size: 18px;
		display: inline-grid;
		place-items: center;
		box-shadow: 0 10px 26px rgba(0, 0, 0, 0.14);
		transition:
			transform 150ms ease,
			box-shadow 150ms ease;
		flex: 0 0 auto;
	}

	.playButton:hover {
		transform: translateY(-2px);
		box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
	}

	/* Clickable / hoverable timeline area */
	.timelineClickArea {
		position: absolute;
		left: 12px;
		right: 12px;
		bottom: 8px;
		height: 14px; /* click target */
		cursor: pointer;
	}

	/* Base line at bottom */
	.timelineBase {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 2px;
		height: 2px;
		background: rgba(0, 0, 0, 0.14);
		border-radius: 999px;
		pointer-events: none;
		transition:
			height 120ms ease,
			bottom 120ms ease;
	}

	/* Progress line that grows */
	.timelineProgress {
		position: absolute;
		left: 0;
		bottom: 2px;
		height: 2px;
		width: var(--progressPercentage);
		background: #3b6d2a;
		border-radius: 999px;
		pointer-events: none;
		transition:
			width 80ms linear,
			height 120ms ease,
			bottom 120ms ease;
	}

	/* Slightly bigger on hover (both lines) */
	.timelineClickArea:hover .timelineBase,
	.timelineClickArea:hover .timelineProgress {
		height: 4px;
		bottom: 1px;
	}

	.trackErrorText {
		margin: 10px 2px 0;
		font-family:
			system-ui,
			-apple-system,
			Segoe UI,
			Roboto,
			Arial,
			sans-serif;
		font-size: 0.95rem;
		opacity: 0.75;
	}
</style>
