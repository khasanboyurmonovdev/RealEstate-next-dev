// Phase 4 Task 8 — next/image migration
import Image from 'next/image';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';

const Footer = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<Image src="/img/logo/ijaraly.svg" alt="Ijaraly" width={120} height={40} className={'logo'} unoptimized />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>We're Here to Help</span>
							<p>support@ijaralygmail.com</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span> Support Center</span>
							<p>+82 1073751408</p>
							<span>Get Support</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>Join Us Online</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular Searches</strong>
								<span>Property for Rent</span>
								<span>Affordable Properties</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
								<span>What We Offer</span>
								<span>Get Help</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Discover</strong>
								<span>Tashkent</span>
								<span>Samarkand</span>
								<span>Bukhara</span>
								<span>Fergana</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Ijaraly - All rights reserved. Ijaraly {moment().year()}</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<Image src="/img/logo/ijaraly2.png" alt="Ijaraly" width={120} height={40} className={'logo'} />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>We're Here to Help</span>
							<p>support@ijaralygmail.com</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>Support Center</span>
							<p>+82 10 7375 1408</p>
							<span>Get Support</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>Join Us Online</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'top'}>
							<strong>Get the Latest News</strong>
							<div>
								<input type="text" placeholder={'Your Email'} />
								<span>Subscribe</span>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>Popular Searches</strong>
								<span>Property for Rent</span>
								<span>Affordable Properties</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
								<span>What We Offer</span>
								<span>Get Help</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Discover</strong>
								<span>Tashkent</span>
								<span>Samarkand</span>
								<span>Bukhara</span>
								<span>Fergana</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Ijaraly - All rights reserved. Ijaraly {moment().year()}</span>
					<span>Privacy · Terms · Sitemap</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
