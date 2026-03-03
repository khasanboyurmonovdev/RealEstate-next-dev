// Phase 4 Task 8 — next/image migration
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';

interface TopAgentProps {
	agent: Member;
}
const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/

	const imgEl = (
		<Image
			src={agentImage}
			alt={agent?.memberNick ?? ''}
			width={209}
			height={209}
			style={{ objectFit: 'cover', borderRadius: '50%' }}
			unoptimized={agentImage.endsWith('.svg')}
		/>
	);

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card">
				{imgEl}
				<strong>{agent?.memberNick}</strong>
				<span>{agent?.memberType}</span>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-agent-card">
				{imgEl}
				<strong>{agent?.memberNick}</strong>
				<span>{agent?.memberType}</span>
			</Stack>
		);
	}
};

export default TopAgentCard;
