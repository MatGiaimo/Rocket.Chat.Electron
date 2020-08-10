import { Box, Button, Field, Margins, Throbber, ToggleSwitch } from '@rocket.chat/fuselage';
import { useUniqueId, useAutoFocus } from '@rocket.chat/fuselage-hooks';
import React, { useState, useEffect, FC, ChangeEvent } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { copyright } from '../../../package.json';
import {
	ABOUT_DIALOG_DISMISSED,
	ABOUT_DIALOG_TOGGLE_UPDATE_ON_START,
	UPDATES_CHECK_FOR_UPDATES_REQUESTED,
} from '../../actions';
import {
	selectAppVersion,
	selectOpenDialog,
	selectIsUpdatingAllowed,
	selectIsUpdatingEnabled,
	selectDoCheckForUpdatesOnStartup,
	selectIsEachUpdatesSettingConfigurable,
	selectUpdateError,
	selectIsCheckingForUpdates,
	selectNewUpdateVersion,
} from '../../selectors';
import { Dialog } from '../Dialog';
import { RocketChatLogo } from '../RocketChatLogo';

export const AboutDialog: FC = () => {
	const appVersion = useSelector(selectAppVersion);
	const doCheckForUpdatesOnStartup = useSelector(selectDoCheckForUpdatesOnStartup);
	const isCheckingForUpdates = useSelector(selectIsCheckingForUpdates);
	const isEachUpdatesSettingConfigurable = useSelector(selectIsEachUpdatesSettingConfigurable);
	const isUpdatingAllowed = useSelector(selectIsUpdatingAllowed);
	const isUpdatingEnabled = useSelector(selectIsUpdatingEnabled);
	const newUpdateVersion = useSelector(selectNewUpdateVersion);
	const openDialog = useSelector(selectOpenDialog);
	const updateError = useSelector(selectUpdateError);

	const isVisible = openDialog === 'about';
	const canUpdate = isUpdatingAllowed && isUpdatingEnabled;
	const isCheckForUpdatesOnStartupChecked = isUpdatingAllowed && isUpdatingEnabled && doCheckForUpdatesOnStartup;
	const canSetCheckForUpdatesOnStartup = isUpdatingAllowed && isEachUpdatesSettingConfigurable;

	const dispatch = useDispatch();

	const { t } = useTranslation();

	const [[checkingForUpdates, checkingForUpdatesMessage], setCheckingForUpdates] = useState([false, null]);

	useEffect(() => {
		if (updateError) {
			setCheckingForUpdates([true, t('dialog.about.errorWhenLookingForUpdates')]);

			const messageTimer = setTimeout(() => {
				setCheckingForUpdates([false, null]);
			}, 5000);

			return () => {
				clearTimeout(messageTimer);
			};
		}

		if (isCheckingForUpdates) {
			setCheckingForUpdates([true, null]);
			return;
		}

		if (newUpdateVersion) {
			setCheckingForUpdates([false, null]);
			return;
		}

		setCheckingForUpdates([true, t('dialog.about.noUpdatesAvailable')]);
		const messageTimer = setTimeout(() => {
			setCheckingForUpdates([false, null]);
		}, 5000);

		return () => {
			clearTimeout(messageTimer);
		};
	}, [updateError, isCheckingForUpdates, newUpdateVersion, t]);

	const handleCheckForUpdatesButtonClick = (): void => {
		dispatch({ type: UPDATES_CHECK_FOR_UPDATES_REQUESTED });
	};

	const handleCheckForUpdatesOnStartCheckBoxChange = (event: ChangeEvent<HTMLInputElement>): void => {
		dispatch({ type: ABOUT_DIALOG_TOGGLE_UPDATE_ON_START, payload: event.target.checked });
	};

	const checkForUpdatesButtonRef = useAutoFocus(isVisible);
	const checkForUpdatesOnStartupToggleSwitchId = useUniqueId();

	return <Dialog isVisible={isVisible} onClose={() => dispatch({ type: ABOUT_DIALOG_DISMISSED })}>
		<Margins block='x16'>
			<RocketChatLogo />

			<Box alignSelf='center'>
				<Trans t={t} i18nKey='dialog.about.version'>
						Version: <Box is='span' fontScale='p2' style={{ userSelect: 'text' }}>{{ version: appVersion }}</Box>
				</Trans>
			</Box>

			{canUpdate && <Box display='flex' flexDirection='column'>
				<Margins block='x8'>
					{!checkingForUpdates && <Button
						ref={checkForUpdatesButtonRef}
						primary
						type='button'
						disabled={checkingForUpdates}
						onClick={handleCheckForUpdatesButtonClick}
					>
						{t('dialog.about.checkUpdates')}
					</Button>}
				</Margins>

				<Margins inline='auto' block='x8'>
					{checkingForUpdates && <Box>
						<Margins block='x12'>
							{checkingForUpdatesMessage
								? <Box fontScale='c1' color='info'>{checkingForUpdatesMessage}</Box>
								: <Throbber size='x16' />}
						</Margins>
					</Box>}

					<Field.Row>
						<ToggleSwitch
							id={checkForUpdatesOnStartupToggleSwitchId}
							checked={isCheckForUpdatesOnStartupChecked}
							disabled={!canSetCheckForUpdatesOnStartup}
							onChange={handleCheckForUpdatesOnStartCheckBoxChange}
						/>
						<Field.Label htmlFor={checkForUpdatesOnStartupToggleSwitchId}>
							{t('dialog.about.checkUpdatesOnStart')}
						</Field.Label>
					</Field.Row>
				</Margins>
			</Box>}

			<Box alignSelf='center' fontScale='micro'>
				{t('dialog.about.copyright', { copyright })}
			</Box>
		</Margins>
	</Dialog>;
};