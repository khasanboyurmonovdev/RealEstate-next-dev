import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface EventData {
	eventTitle: string;
	city: string;
	description: string;
	imageSrc: string;
}
const eventsData: EventData[] = [
	{
		eventTitle: 'Novruz Bayram',
		city: 'Tashkent',
		description:
			'Celebrate the spring equinox festival with traditional food, music, and festivities across Uzbekistan.',
		imageSrc: '/img/events/newyork.jpg',
	},
	{
		eventTitle: 'Tashkent International Film Festival',
		city: 'Tashkent',
		description:
			'Experience world cinema and local productions at the annual film festival in the heart of Tashkent.',
		imageSrc: '/img/events/chicago.jpg',
	},
	{
		eventTitle: 'Silk and Spices Festival',
		city: 'Bukhara',
		description:
			'Discover the heritage of the Silk Road with traditional crafts, music, and cultural performances in historic Bukhara.',
		imageSrc: '/img/events/NEWORLEANS.jpg',
	},
	{
		eventTitle: 'Shahrisabz Culture Day',
		city: 'Samarkand',
		description:
			'Explore the birthplace of Amir Timur with cultural exhibitions, folk performances, and historical tours.',
		imageSrc: '/img/events/seattle.jpg',
	},
];

const EventCard = ({ event }: { event: EventData }) => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack
				className="event-card"
				style={{
					backgroundImage: `url(${event?.imageSrc})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<Box component={'div'} className={'info'}>
					<strong>{event?.city}</strong>
					<span>{event?.eventTitle}</span>
				</Box>
				<Box component={'div'} className={'more'}>
					<span>{event?.description}</span>
				</Box>
			</Stack>
		);
	}
};

const Events = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack className={'events'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span className={'white'}>Events</span>
							<p className={'white'}>Stay connected. Discover upcoming events near you.</p>
						</Box>
					</Stack>
					<Stack className={'card-wrapper'}>
						{eventsData.map((event: EventData) => {
							return <EventCard event={event} key={event?.eventTitle} />;
						})}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Events;
