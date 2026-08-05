<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	export let artistNameString: string;
	export let songTitleString: string;
	export let mp3UrlString: string;
	export let isFixedLayout = false;
	export let shouldAutoplay = false;
	export let visualMode: 'card' | 'rail' | 'chapter' = 'card';
	export let ambientLabelString = 'Now listening';

	let audioElementReference: HTMLAudioElement | null = null;
	let timelineContainerElementReference: HTMLDivElement | null = null;

	let isAudioPlayingBoolean = false;
	let isAudioLoadingBoolean = false;
	let hasAudioErrorBoolean = false;
	let hasAutoplayBeenBlockedBoolean = false;
	let hasAutoplayBeenAttemptedBoolean = false;
	let isMutedBoolean = false;

	let audioDurationSecondsNumber = 0;
	let audioCurrentTimeSecondsNumber = 0;
	let progressPercentageNumber = 0;

	let progressAnimationFrameIdNumber: number | null = null;
	let pendingResumeFromUserGestureHandler: (() => void) | null = null;
	let isSeekingBoolean = false;

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
		audioElementReference.muted = isMutedBoolean;

		audioElementReference.addEventListener('loadedmetadata', updateProgressValuesFromAudioElement);
		audioElementReference.addEventListener('timeupdate', updateProgressValuesFromAudioElement);

		audioElementReference.addEventListener('playing', () => {
			isAudioPlayingBoolean = true;
			isAudioLoadingBoolean = false;
			hasAudioErrorBoolean = false;
			hasAutoplayBeenBlockedBoolean = false;
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
			hasAutoplayBeenBlockedBoolean = true;
			isAudioLoadingBoolean = false;
			isAudioPlayingBoolean = false;
			stopProgressAnimationLoop();
		});
	}

	function toggleMutedState() {
		isMutedBoolean = !isMutedBoolean;

		if (audioElementReference) {
			audioElementReference.muted = isMutedBoolean;
		}
	}

	function tryAutoplayAudio() {
		if (!shouldAutoplay || hasAutoplayBeenAttemptedBoolean) return;

		hasAutoplayBeenAttemptedBoolean = true;
		hasAudioErrorBoolean = false;

		ensureAudioElementExistsAndHasListeners();
		if (!audioElementReference) return;

		audioElementReference.volume = 0.72;
		audioElementReference.muted = isMutedBoolean;
		isAudioLoadingBoolean = true;

		audioElementReference.play().catch(() => {
			hasAutoplayBeenBlockedBoolean = true;
			isAudioLoadingBoolean = false;
			isAudioPlayingBoolean = false;
			stopProgressAnimationLoop();

			if (!pendingResumeFromUserGestureHandler) {
				pendingResumeFromUserGestureHandler = () => {
					window.removeEventListener('pointerdown', pendingResumeFromUserGestureHandler as EventListener);
					window.removeEventListener('keydown', pendingResumeFromUserGestureHandler as EventListener);
					pendingResumeFromUserGestureHandler = null;
					togglePlayback();
				};

				window.addEventListener('pointerdown', pendingResumeFromUserGestureHandler, { once: true });
				window.addEventListener('keydown', pendingResumeFromUserGestureHandler, { once: true });
			}
		});
	}

	function seekToTimelinePosition(eventObject: MouseEvent | PointerEvent) {
		if (!audioElementReference || !timelineContainerElementReference) return;
		if (!Number.isFinite(audioElementReference.duration) || audioElementReference.duration <= 0) return;

		const timelineRect = timelineContainerElementReference.getBoundingClientRect();
		const rawClickRatio = (eventObject.clientX - timelineRect.left) / timelineRect.width;
		const clampedClickRatio = Math.min(1, Math.max(0, rawClickRatio));

		audioElementReference.currentTime = clampedClickRatio * audioElementReference.duration;
		updateProgressValuesFromAudioElement();
	}

	function handleTimelinePointerDown(eventObject: PointerEvent) {
		if (eventObject.button !== 0) return;

		isSeekingBoolean = true;
		seekToTimelinePosition(eventObject);

		const currentTargetElement = eventObject.currentTarget;
		if (currentTargetElement instanceof Element) {
			currentTargetElement.setPointerCapture(eventObject.pointerId);
		}
	}

	function handleTimelinePointerMove(eventObject: PointerEvent) {
		if (!isSeekingBoolean) return;

		seekToTimelinePosition(eventObject);
	}

	function handleTimelinePointerUp(eventObject: PointerEvent) {
		if (isSeekingBoolean) {
			isSeekingBoolean = false;
		}

		const currentTargetElement = eventObject.currentTarget;
		if (currentTargetElement instanceof Element && currentTargetElement.hasPointerCapture(eventObject.pointerId)) {
			currentTargetElement.releasePointerCapture(eventObject.pointerId);
		}
	}

	function handleTimelinePointerCancel(eventObject: PointerEvent) {
		handleTimelinePointerUp(eventObject);
	}

	function seekByDeltaSeconds(deltaValue: number) {
		if (!audioElementReference) return;
		if (!Number.isFinite(audioElementReference.duration) || audioElementReference.duration <= 0) return;

		const nextTime = Math.min(
			audioElementReference.duration,
			Math.max(0, audioElementReference.currentTime + deltaValue)
		);

		audioElementReference.currentTime = nextTime;
		updateProgressValuesFromAudioElement();
	}

	function handleTimelineKeydown(eventObject: KeyboardEvent) {
		if (eventObject.key === 'ArrowRight') {
			eventObject.preventDefault();
			seekByDeltaSeconds(5);
			return;
		}

		if (eventObject.key === 'ArrowLeft') {
			eventObject.preventDefault();
			seekByDeltaSeconds(-5);
		}
	}

	function formatTimeLabel(totalSecondsValue: number) {
		if (!Number.isFinite(totalSecondsValue) || totalSecondsValue < 0) return '0:00';
		const roundedSeconds = Math.floor(totalSecondsValue);
		const minutesValue = Math.floor(roundedSeconds / 60);
		const secondsValue = roundedSeconds % 60;
		return `${minutesValue}:${String(secondsValue).padStart(2, '0')}`;
	}

	$: if (audioElementReference) {
		audioElementReference.muted = isMutedBoolean;
	}

	onMount(() => {
		tryAutoplayAudio();
	});

	onDestroy(() => {
		if (pendingResumeFromUserGestureHandler) {
			window.removeEventListener('pointerdown', pendingResumeFromUserGestureHandler as EventListener);
			window.removeEventListener('keydown', pendingResumeFromUserGestureHandler as EventListener);
			pendingResumeFromUserGestureHandler = null;
		}

		stopAndResetAudio();
		audioElementReference = null;
	});
</script>

{#if isFixedLayout}
	<div class="fixedPlayerContainer">
		<button
			class="playerButton"
			type="button"
			on:click={togglePlayback}
			aria-pressed={isAudioPlayingBoolean}
			aria-label={isAudioPlayingBoolean ? 'Pause track' : 'Play track'}
		>
			<div class="equalizerContainer" class:isPlaying={isAudioPlayingBoolean}>
				<div class="equalizerBar" style="--bar-delay: 0ms"></div>
				<div class="equalizerBar" style="--bar-delay: 100ms"></div>
				<div class="equalizerBar" style="--bar-delay: 200ms"></div>
				<div class="equalizerBar" style="--bar-delay: 300ms"></div>
				<div class="equalizerBar" style="--bar-delay: 400ms"></div>
			</div>

			<div class="playIconOverlay playIconPlay">▶</div>
			<div class="playIconOverlay playIconPause">⏸</div>
		</button>

		<div class="playerInfo">
			<div class="artistLabel">{ambientLabelString}</div>
			<div class="trackName">{songTitleString}</div>
		</div>

		<div
			class="timelineBar"
			bind:this={timelineContainerElementReference}
			role="slider"
			aria-label="Seek audio"
			aria-valuemin="0"
			aria-valuemax={audioDurationSecondsNumber}
			aria-valuenow={audioCurrentTimeSecondsNumber}
			aria-valuetext={`${formatTimeLabel(audioCurrentTimeSecondsNumber)} of ${formatTimeLabel(audioDurationSecondsNumber)}`}
			tabindex="0"
			class:isSeeking={isSeekingBoolean}
			on:pointerdown={handleTimelinePointerDown}
			on:pointermove={handleTimelinePointerMove}
			on:pointerup={handleTimelinePointerUp}
			on:pointercancel={handleTimelinePointerCancel}
			on:keydown={handleTimelineKeydown}
		>
			<div class="timelineTrack"></div>
			<div class="timelineProgress" style="width: {progressPercentageNumber}%"></div>
		</div>

		{#if hasAudioErrorBoolean}
			<p class="trackErrorText">Couldn't play this audio file.</p>
		{/if}
	</div>
{:else}
	<div
		class={`trackRow mode-${visualMode}`}
		style={`--progressPercentage: ${progressPercentageNumber}%;`}
	>
		<div class="trackText">
			<span class="trackAmbientLabel">{ambientLabelString}</span>
			<div class="trackTitleRow">
				<span class="trackArtist">{artistNameString}</span>
				<span class="trackDash"> - </span>
				<span class="trackSong">{songTitleString}</span>
			</div>
			{#if hasAutoplayBeenBlockedBoolean && !isAudioPlayingBoolean}
				<span class="trackAutoplayHint">Tap play to start audio</span>
			{/if}
		</div>

		<button
			class="playButton"
			type="button"
			on:click={togglePlayback}
			aria-pressed={isAudioPlayingBoolean}
			aria-label={isAudioPlayingBoolean ? 'Pause track' : 'Play track'}
		>
			{#if isAudioLoadingBoolean}
				...
			{:else if isAudioPlayingBoolean}
				⏸
			{:else}
				>
			{/if}
		</button>

		<button
			class="muteButton"
			type="button"
			on:click={toggleMutedState}
			aria-pressed={isMutedBoolean}
			aria-label={isMutedBoolean ? 'Unmute audio' : 'Mute audio'}
		>
			{#if isMutedBoolean}
				Mute
			{:else}
				Sound
			{/if}
		</button>

		<div
			class="timelineClickArea"
			bind:this={timelineContainerElementReference}
			role="slider"
			aria-label="Seek audio"
			aria-valuemin="0"
			aria-valuemax={audioDurationSecondsNumber}
			aria-valuenow={audioCurrentTimeSecondsNumber}
			aria-valuetext={`${formatTimeLabel(audioCurrentTimeSecondsNumber)} of ${formatTimeLabel(audioDurationSecondsNumber)}`}
			tabindex="0"
			class:isSeeking={isSeekingBoolean}
			on:pointerdown={handleTimelinePointerDown}
			on:pointermove={handleTimelinePointerMove}
			on:pointerup={handleTimelinePointerUp}
			on:pointercancel={handleTimelinePointerCancel}
			on:keydown={handleTimelineKeydown}
		>
			<div class="timelineBase" aria-hidden="true"></div>
			<div class="timelineProgress" aria-hidden="true"></div>
		</div>
	</div>
{/if}

<style>
	.fixedPlayerContainer {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		z-index: 55;
		pointer-events: none;
	}

	.playerButton {
		position: fixed;
		left: 12px;
		bottom: 23px;
		width: 52px;
		height: 52px;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		pointer-events: all;
		transition: opacity 180ms ease;
		z-index: 56;
	}

	.playerButton:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--accent, #2f6759) 70%, white);
		outline-offset: 2px;
		border-radius: 4px;
	}

	.equalizerContainer {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 2px;
		width: 34px;
		height: 34px;
		opacity: 0;
		transition: opacity 220ms ease;
		transform: translateY(3px);
	}

	.equalizerContainer.isPlaying {
		opacity: 1;
	}

	.playerButton:hover .equalizerContainer.isPlaying {
		opacity: 0.1;
	}

	.equalizerBar {
		width: 4px;
		height: 100%;
		background: color-mix(in srgb, var(--accent, #2f6759) 82%, var(--paper, #eef2eb));
		border-radius: 1px;
		animation-name: equalizerPulseA;
		animation-delay: var(--bar-delay);
		animation-duration: var(--bar-duration, 1800ms);
		animation-timing-function: cubic-bezier(0.35, 0, 0.25, 1);
		animation-iteration-count: infinite;
	}

	.equalizerBar:nth-child(1) {
		--bar-duration: 1600ms;
		background: color-mix(in srgb, var(--accent, #2f6759) 72%, white);
	}

	.equalizerBar:nth-child(2) {
		--bar-duration: 2100ms;
		background: color-mix(in srgb, var(--accent, #2f6759) 86%, var(--paper, #eef2eb));
	}

	.equalizerBar:nth-child(3) {
		--bar-duration: 1950ms;
		background: color-mix(in srgb, var(--accent, #2f6759) 66%, white);
	}

	.equalizerBar:nth-child(4) {
		--bar-duration: 2250ms;
		background: color-mix(in srgb, var(--accent, #2f6759) 92%, var(--ink, #15201d));
	}

	.equalizerBar:nth-child(5) {
		--bar-duration: 1800ms;
		background: color-mix(in srgb, var(--accent, #2f6759) 78%, var(--paper, #eef2eb));
	}

	@keyframes equalizerPulseA {
		0%,
		100% {
			height: 25%;
			opacity: 0.45;
		}
		18% {
			height: 80%;
			opacity: 0.95;
		}
		37% {
			height: 42%;
			opacity: 0.72;
		}
		64% {
			height: 100%;
			opacity: 1;
		}
		82% {
			height: 58%;
			opacity: 0.8;
		}
	}

	.playIconOverlay {
		position: absolute;
		top: 50%;
		transform: translateY(calc(-50% + 4px));
		font-size: 18px;
		color: var(--ink, #15201d);
		opacity: 0;
		transition:
			opacity 220ms ease,
			transform 220ms ease;
	}

	.playIconOverlay.playIconPlay {
		opacity: 1;
	}

	.playIconOverlay.playIconPause {
		transform: translateY(calc(-50% + 4px)) scale(0.96);
	}

	.playerButton[aria-pressed="true"] .playIconOverlay.playIconPause {
		opacity: 0;
	}

	.playerButton:hover[aria-pressed="true"] .playIconOverlay.playIconPause {
		opacity: 1;
		transform: translateY(calc(-50% + 4px)) scale(1);
	}

	.playerButton[aria-pressed="true"] .playIconOverlay.playIconPlay {
		opacity: 0;
	}

	.playerInfo {
		position: fixed;
		left: 72px;
		bottom: 23px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		pointer-events: none;
	}

	.artistLabel {
		font-family: var(--fontUi, system-ui, sans-serif);
		font-size: 0.82rem;
		letter-spacing: 0.01em;
		text-transform: none;
		color: rgba(21, 32, 29, 0.65);
		font-weight: 700;
	}

	.trackName {
		font-family: var(--fontBody, serif);
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--ink, #15201d);
		letter-spacing: -0.01em;
		line-height: 1.02;
	}

	.timelineBar {
		position: fixed;
		left: 12px;
		bottom: 5px;
		width: min(calc(100% - 24px), 400px);
		height: 14px;
		cursor: grab;
		background: transparent;
		pointer-events: all;
		z-index: 55;
	}

	.timelineTrack {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 4px;
		background: transparent;
		border-radius: 999px;
		pointer-events: none;
		transition:
			height 220ms cubic-bezier(0.22, 1, 0.36, 1),
			bottom 220ms cubic-bezier(0.22, 1, 0.36, 1),
			background-color 180ms ease;
	}

	.timelineProgress {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 4px;
		background: var(--accent, #2f6759);
		border-radius: 999px;
		pointer-events: none;
		transition:
			width 120ms linear,
			height 220ms cubic-bezier(0.22, 1, 0.36, 1),
			bottom 220ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.timelineBar:hover .timelineTrack,
	.timelineBar:hover .timelineProgress,
	.fixedPlayerContainer:hover .timelineTrack,
	.fixedPlayerContainer:hover .timelineProgress,
	.timelineBar.isSeeking .timelineTrack,
	.timelineBar.isSeeking .timelineProgress,
	.timelineBar:active .timelineTrack,
	.timelineBar:active .timelineProgress {
		height: 8px;
	}

	.timelineBar:hover .timelineTrack,
	.fixedPlayerContainer:hover .timelineTrack,
	.timelineBar.isSeeking .timelineTrack,
	.timelineBar:active .timelineTrack {
		background: rgba(255, 255, 255, 0.9);
	}

	.trackErrorText {
		position: fixed;
		left: 18px;
		bottom: 55px;
		margin: 0;
		font-family: var(--fontUi, system-ui, sans-serif);
		font-size: 0.82rem;
		opacity: 0.75;
		color: var(--ink, #15201d);
	}

	/* Original card layout styles */
	.trackRow {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 12px 16px;
		border-radius: 14px;
		border: 1px solid color-mix(in srgb, var(--accent, #2f6759) 20%, transparent);
		background: color-mix(in srgb, var(--paper, #eef2eb) 88%, white);
		box-shadow: 0 12px 26px rgba(21, 32, 29, 0.12);
		backdrop-filter: blur(8px);
		--progressPercentage: 0%;
	}

	.trackRow.mode-rail {
		gap: 10px;
		padding: 10px 12px 14px;
		max-width: 350px;
		background: color-mix(in srgb, var(--paper, #eef2eb) 80%, white);
		backdrop-filter: blur(10px);
	}

	.trackRow.mode-chapter {
		padding: 10px 12px 12px;
		border-radius: 6px;
		border-color: color-mix(in srgb, var(--accent, #2f6759) 28%, transparent);
		box-shadow: none;
		background: color-mix(in srgb, var(--accent, #2f6759) 7%, transparent);
	}

	.trackText {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1px;
		font-family: var(--fontUi, system-ui, sans-serif);
		font-weight: 700;
		font-size: 0.92rem;
		letter-spacing: 0.02em;
		color: color-mix(in srgb, var(--ink, #15201d) 88%, white);
		overflow: hidden;
		white-space: nowrap;
	}

	.trackAmbientLabel {
		font-family: var(--fontUi, system-ui, sans-serif);
		font-size: 0.62rem;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		opacity: 0.7;
	}

	.trackTitleRow {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.trackArtist {
		font-size: 1rem;
		font-weight: 800;
	}

	.trackDash {
		opacity: 0.55;
	}

	.trackSong {
		font-size: 1rem;
		font-weight: 600;
	}

	.mode-rail .trackArtist,
	.mode-rail .trackDash {
		display: none;
	}

	.mode-chapter .trackText {
		font-size: 0.84rem;
	}

	.playButton {
		width: 40px;
		height: 40px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--accent, #2f6759) 26%, transparent);
		cursor: pointer;
		background: color-mix(in srgb, var(--accent, #2f6759) 85%, #0b1512);
		color: #f3f7f2;
		font-size: 15px;
		display: inline-grid;
		place-items: center;
		box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			background-color 180ms ease;
		flex: 0 0 auto;
	}

	.mode-rail .playButton,
	.mode-chapter .playButton {
		width: 34px;
		height: 34px;
		font-size: 12px;
	}

	.playButton:hover {
		transform: translateY(-1px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
	}

	.muteButton {
		height: 34px;
		padding: 0 10px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--accent, #2f6759) 26%, transparent);
		cursor: pointer;
		background: color-mix(in srgb, var(--paper, #eef2eb) 74%, white);
		font-family: var(--fontUi, system-ui, sans-serif);
		font-size: 0.67rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--ink, #15201d) 84%, white);
		transition:
			transform 180ms ease,
			background-color 180ms ease;
	}

	.muteButton:hover {
		transform: translateY(-1px);
		background: color-mix(in srgb, var(--accent, #2f6759) 16%, var(--paper, #eef2eb));
	}

	.playButton:focus-visible,
	.muteButton:focus-visible,
	.timelineClickArea:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--accent, #2f6759) 70%, white);
		outline-offset: 2px;
	}

	.timelineClickArea {
		position: absolute;
		left: 12px;
		right: 12px;
		bottom: 8px;
		height: 14px;
		cursor: grab;
		touch-action: none;
	}

	.mode-chapter .timelineClickArea {
		bottom: 4px;
	}

	.timelineBase {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 2px;
		height: 4px;
		background: transparent;
		border-radius: 999px;
		pointer-events: none;
		transition:
			height 220ms cubic-bezier(0.22, 1, 0.36, 1),
			bottom 220ms cubic-bezier(0.22, 1, 0.36, 1),
			background-color 180ms ease;
	}

	.timelineProgress {
		position: absolute;
		left: 0;
		bottom: 2px;
		height: 4px;
		width: var(--progressPercentage);
		background: var(--accent, #2f6759);
		border-radius: 999px;
		pointer-events: none;
		transition:
			width 120ms linear,
			height 220ms cubic-bezier(0.22, 1, 0.36, 1),
			bottom 220ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.timelineClickArea:hover .timelineBase,
	.timelineClickArea:hover .timelineProgress {
		height: 8px;
		bottom: 0;
	}

	.timelineBar:active,
	.timelineBar.isSeeking,
	.timelineClickArea:active,
	.timelineClickArea.isSeeking {
		cursor: grabbing;
	}

	.timelineClickArea:hover .timelineBase,
	.timelineClickArea.isSeeking .timelineBase,
	.timelineClickArea:active .timelineBase {
		background: rgba(255, 255, 255, 0.9);
	}

	.timelineClickArea.isSeeking .timelineBase,
	.timelineClickArea.isSeeking .timelineProgress,
	.timelineClickArea:active .timelineBase,
	.timelineClickArea:active .timelineProgress {
		height: 8px;
	}

	.trackAutoplayHint {
		margin-top: 1px;
		font-family: var(--fontUi, system-ui, sans-serif);
		font-size: 0.64rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.72;
	}

	.trackErrorText {
		margin: 10px 2px 0;
		font-family: var(--fontUi, system-ui, sans-serif);
		font-size: 0.82rem;
		opacity: 0.75;
	}

	@media (max-width: 720px) {
		.playerInfo {
			left: 66px;
			bottom: 16px;
		}

		.trackName {
			font-size: 0.95rem;
		}

		.ambientLabel {
			font-size: 0.58rem;
		}
	}
</style>
