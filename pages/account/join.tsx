// Phase 4 Task 6 — Mobile polish
// Phase 4 Task 8 — next/image migration
// Phase 5 — Phone OTP login flow
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp, updateStorage, updateUserInfo } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation } from '@apollo/client';
import { SEND_OTP, LOGIN_WITH_OTP, LOGIN_WITH_TELEGRAM } from '../../apollo/user/mutation';
import { TLoginButton, TUser } from 'react-telegram-auth';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const formatPhoneUZ = (value: string): string => {
	const digits = value.replace(/\D/g, '');
	const numPart = digits.startsWith('998') ? digits.slice(3, 12) : digits.slice(0, 9);
	if (!numPart) return '+998';
	const parts = [numPart.slice(0, 2), numPart.slice(2, 5), numPart.slice(5, 7), numPart.slice(7, 9)].filter(Boolean);
	return '+998 ' + parts.join(' ');
};

const getRawPhone = (phone: string): string => {
	const digits = phone.replace(/\D/g, '');
	return digits.startsWith('998') ? '+' + digits.slice(0, 12) : '+998' + digits.slice(0, 9);
};

const isPhoneValid = (phone: string): boolean => /^\+998\d{9}$/.test(getRawPhone(phone));

/* ─── OTP digit inputs ─── */
function OtpInputGroup({
	value,
	onChange,
	onComplete,
}: {
	value: string;
	onChange: (v: string) => void;
	onComplete: () => void;
}) {
	const refs = useRef<(HTMLInputElement | null)[]>([]);
	const digits = value.padEnd(6, '').slice(0, 6).split('');

	const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			e.preventDefault();
			const next = digits.slice();
			if (next[idx]) {
				next[idx] = '';
				onChange(next.join(''));
			} else if (idx > 0) {
				next[idx - 1] = '';
				onChange(next.join(''));
				refs.current[idx - 1]?.focus();
			}
		}
	};

	const handleInput = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
		const ch = e.target.value.replace(/\D/g, '').slice(-1);
		if (!ch) return;
		const next = digits.slice();
		next[idx] = ch;
		const joined = next.join('');
		onChange(joined);
		if (joined.length === 6 && !joined.includes('')) {
			refs.current[idx]?.blur();
			onComplete();
		} else if (idx < 5) {
			refs.current[idx + 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
		if (pasted.length > 0) {
			onChange(pasted);
			const focusIdx = Math.min(pasted.length, 5);
			refs.current[focusIdx]?.focus();
			if (pasted.length === 6) onComplete();
		}
	};

	return (
		<div className="otp-inputs" onPaste={handlePaste}>
			{digits.map((d, i) => (
				<input
					key={i}
					ref={(el) => { refs.current[i] = el; }}
					type="text"
					inputMode="numeric"
					maxLength={1}
					value={d || ''}
					autoFocus={i === 0}
					onChange={(e) => handleInput(i, e)}
					onKeyDown={(e) => handleKey(i, e)}
					className="otp-digit"
				/>
			))}
		</div>
	);
}

/* ─── Checkmark animation (CSS-only) ─── */
function SuccessCheck() {
	return (
		<div className="success-check">
			<svg viewBox="0 0 52 52" width="72" height="72">
				<circle className="success-check__circle" cx="26" cy="26" r="25" fill="none" />
				<path className="success-check__tick" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
			</svg>
		</div>
	);
}

/* ─── Classic login form (nick/password) ─── */
function ClassicLoginForm({
	onBack,
	isMobile,
}: {
	onBack: () => void;
	isMobile: boolean;
}) {
	const router = useRouter();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState(true);
	const [phoneError, setPhoneError] = useState('');

	const handleInput = useCallback((name: string, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
		if (name === 'phone') setPhoneError('');
	}, []);

	const handlePhoneChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => handleInput('phone', formatPhoneUZ(e.target.value)),
		[handleInput],
	);

	const checkUserTypeHandler = (e: any) => {
		handleInput('type', e.target.checked ? e.target.name : 'USER');
	};

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);

	const doSignUp = useCallback(async () => {
		if (!loginView && !isPhoneValid(input.phone)) {
			setPhoneError("Telefon raqam +998 bilan boshlanishi kerak");
			return;
		}
		setPhoneError('');
		try {
			await signUp(input.nick, input.password, getRawPhone(input.phone), input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, loginView, router]);

	return (
		<>
			<Box className="info">
				<span>{loginView ? 'Kirish' : "Ro'yxatdan o'tish"}</span>
				<p>{loginView ? 'Foydalanuvchi nomi va parol bilan kiring.' : "Yangi hisob yarating."}</p>
			</Box>
			<Box className="input-wrap">
				<div className="input-box">
					<span>Foydalanuvchi nomi</span>
					<input
						type="text"
						placeholder="Ismingizni kiriting"
						onChange={(e) => handleInput('nick', e.target.value)}
						required
						onKeyDown={(e) => e.key === 'Enter' && (loginView ? doLogin() : doSignUp())}
					/>
				</div>
				<div className="input-box">
					<span>Parol</span>
					<input
						type="password"
						placeholder="Parolni kiriting"
						onChange={(e) => handleInput('password', e.target.value)}
						required
						onKeyDown={(e) => e.key === 'Enter' && (loginView ? doLogin() : doSignUp())}
					/>
				</div>
				{!loginView && (
					<div className="input-box">
						<span>Telefon</span>
						<input
							type="tel"
							placeholder="+998 XX XXX XX XX"
							value={input.phone}
							onChange={handlePhoneChange}
							required
							onKeyDown={(e) => e.key === 'Enter' && doSignUp()}
						/>
						{phoneError && (
							<Typography sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>{phoneError}</Typography>
						)}
					</div>
				)}
			</Box>
			<Box className="register">
				{!loginView && (
					<div className="type-option">
						<span className="text">Men sifatida ro'yxatdan o'tmoqchiman:</span>
						<div>
							<FormGroup>
								<FormControlLabel
									control={<Checkbox size="small" name="USER" onChange={checkUserTypeHandler} checked={input.type === 'USER'} />}
									label="Foydalanuvchi"
								/>
							</FormGroup>
							<FormGroup>
								<FormControlLabel
									control={<Checkbox size="small" name="AGENT" onChange={checkUserTypeHandler} checked={input.type === 'AGENT'} />}
									label="Agent"
								/>
							</FormGroup>
						</div>
					</div>
				)}
				{loginView ? (
					<Button
						variant="contained"
						disabled={!input.nick || !input.password}
						onClick={doLogin}
						endIcon={<Image src="/img/icons/rightup.svg" alt="" width={16} height={16} unoptimized />}
					>
						KIRISH
					</Button>
				) : (
					<Button
						variant="contained"
						disabled={!input.nick || !input.password || !input.phone || !input.type}
						onClick={doSignUp}
						endIcon={<Image src="/img/icons/rightup.svg" alt="" width={16} height={16} unoptimized />}
					>
						RO'YXATDAN O'TISH
					</Button>
				)}
			</Box>
			<Box className="ask-info">
				{loginView ? (
					<p>
						Hisob yo'qmi? <b onClick={() => setLoginView(false)}>RO'YXATDAN O'TISH</b>
					</p>
				) : (
					<p>
						Hisobingiz bormi? <b onClick={() => setLoginView(true)}>KIRISH</b>
					</p>
				)}
				<p style={{ marginTop: 12 }}>
					<b onClick={onBack}>← Telefon orqali kirish</b>
				</p>
			</Box>
		</>
	);
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [phone, setPhone] = useState('+998');
	const [otpCode, setOtpCode] = useState('');
	const [phoneError, setPhoneError] = useState('');
	const [otpError, setOtpError] = useState('');
	const [countdown, setCountdown] = useState(0);
	const [showClassic, setShowClassic] = useState(false);

	const [sendOtp, { loading: sendingOtp }] = useMutation(SEND_OTP);
	const [loginWithOtp, { loading: verifyingOtp }] = useMutation(LOGIN_WITH_OTP);
	const [loginWithTelegram] = useMutation(LOGIN_WITH_TELEGRAM);

	/* countdown timer for resend */
	useEffect(() => {
		if (countdown <= 0) return;
		const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [countdown]);

	/* step 3 → redirect after 1.5s */
	useEffect(() => {
		if (step !== 3) return;
		const t = setTimeout(() => {
			router.push(`${router.query.referrer ?? '/'}`);
		}, 1500);
		return () => clearTimeout(t);
	}, [step, router]);

	const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setPhone(formatPhoneUZ(e.target.value));
		setPhoneError('');
	}, []);

	const handleSendOtp = useCallback(async () => {
		const raw = getRawPhone(phone);
		if (!isPhoneValid(phone)) {
			setPhoneError("Telefon raqam +998 bilan boshlanishi kerak");
			return;
		}
		try {
			await sendOtp({ variables: { input: { memberPhone: raw } } });
			setCountdown(60);
			setOtpCode('');
			setOtpError('');
			setStep(2);
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message || err.message;
			setPhoneError(msg);
		}
	}, [phone, sendOtp]);

	const handleVerifyOtp = useCallback(async () => {
		const code = otpCode.replace(/\D/g, '');
		if (code.length !== 6) return;
		const raw = getRawPhone(phone);
		try {
			const { data } = await loginWithOtp({ variables: { input: { memberPhone: raw, otpCode: code } } });
			const { accessToken } = data.loginWithOtp;
			updateStorage({ jwtToken: accessToken });
			updateUserInfo(accessToken);
			setStep(3);
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message || err.message;
			if (msg.includes('WRONG_CODE')) setOtpError("Noto'g'ri kod kiritildi");
			else if (msg.includes('OTP_EXPIRED')) setOtpError('Kod muddati tugagan. Qayta yuboring.');
			else if (msg.includes('MAX_ATTEMPTS')) setOtpError("Ko'p urinish. Keyinroq qaytadan urinib ko'ring.");
			else setOtpError(msg);
		}
	}, [otpCode, phone, loginWithOtp]);

	const handleResend = useCallback(async () => {
		if (countdown > 0) return;
		const raw = getRawPhone(phone);
		try {
			await sendOtp({ variables: { input: { memberPhone: raw } } });
			setCountdown(60);
			setOtpError('');
			setOtpCode('');
		} catch (err: any) {
			setOtpError(err?.graphQLErrors?.[0]?.message || err.message);
		}
	}, [countdown, phone, sendOtp]);

	const handleTelegramAuth = useCallback(async (user: TUser) => {
		try {
			const { data } = await loginWithTelegram({
				variables: {
					input: {
						telegramId: user.id,
						firstName: user.first_name,
						lastName: user.last_name || '',
						username: user.username || '',
						photoUrl: user.photo_url || '',
						authDate: user.auth_date,
						hash: user.hash,
					},
				},
			});
			const { accessToken } = data.loginWithTelegram;
			updateStorage({ jwtToken: accessToken });
			updateUserInfo(accessToken);
			setStep(3);
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.graphQLErrors?.[0]?.message || err.message);
		}
	}, [loginWithTelegram]);

	/* ─── RENDER INNER CONTENT (shared between mobile/desktop) ─── */
	const renderContent = () => {
		if (showClassic) {
			return <ClassicLoginForm onBack={() => setShowClassic(false)} isMobile={isMobile} />;
		}

		if (step === 1) {
			return (
				<>
					<Box className="info">
						<span>Telefon raqamingiz</span>
						<p>SMS kod orqali tez va xavfsiz kiring</p>
					</Box>
					<Box className="input-wrap">
						<div className="input-box">
							<span>Telefon raqam</span>
							<input
								type="tel"
								placeholder="+998 XX XXX XX XX"
								value={phone}
								onChange={handlePhoneChange}
								onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
							/>
							{phoneError && (
								<Typography sx={{ color: 'error.main', fontSize: 12, mt: 0.5 }}>{phoneError}</Typography>
							)}
						</div>
					</Box>
					<Box className="register">
						<Button
							variant="contained"
							disabled={sendingOtp || !isPhoneValid(phone)}
							onClick={handleSendOtp}
							sx={{ gap: 1 }}
						>
							{sendingOtp ? <CircularProgress size={20} color="inherit" /> : 'SMS kod yuborish'}
						</Button>
					</Box>
					<div className="auth-divider">
						<span>yoki</span>
					</div>
					<Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
						<TLoginButton
							botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ijaraly_bot'}
							buttonSize="large"
							cornerRadius={8}
							onAuthCallback={handleTelegramAuth}
							requestAccess="write"
						/>
					</Box>
					<Box className="ask-info">
						<p>
							<b onClick={() => setShowClassic(true)}>Parol bilan kirish →</b>
						</p>
					</Box>
				</>
			);
		}

		if (step === 2) {
			return (
				<>
					<Box className="info">
						<span>SMS kodni kiriting</span>
						<p>
							<b onClick={() => setStep(1)} style={{ cursor: 'pointer', fontWeight: 500 }}>
								← Orqaga
							</b>
							{' '}&nbsp; {phone}
						</p>
					</Box>
					<Box className="input-wrap">
						<OtpInputGroup value={otpCode} onChange={setOtpCode} onComplete={handleVerifyOtp} />
						{otpError && (
							<Typography sx={{ color: 'error.main', fontSize: 13, mt: 1.5, textAlign: 'center' }}>{otpError}</Typography>
						)}
					</Box>
					<Box className="register">
						<Button variant="contained" disabled={verifyingOtp || otpCode.replace(/\D/g, '').length !== 6} onClick={handleVerifyOtp} sx={{ gap: 1 }}>
							{verifyingOtp ? <CircularProgress size={20} color="inherit" /> : 'Tasdiqlash'}
						</Button>
					</Box>
					<Box className="ask-info">
						<p>
							{countdown > 0 ? (
								<span style={{ color: '#999' }}>Qayta yuborish ({countdown}s)</span>
							) : (
								<b onClick={handleResend} style={{ cursor: 'pointer' }}>Kodni qayta yuborish</b>
							)}
						</p>
					</Box>
				</>
			);
		}

		/* step 3 — success */
		return (
			<>
				<Box className="info" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
					<SuccessCheck />
					<span style={{ marginTop: 24, fontSize: 22 }}>Xush kelibsiz!</span>
					<p style={{ marginTop: 8 }}>Siz muvaffaqiyatli kirdingiz</p>
				</Box>
			</>
		);
	};

	/* ─── LAYOUT WRAPPER ─── */
	if (isMobile) {
		return (
			<Stack className="join-page join-page-mobile">
				<style>{otpStyles}</style>
				<Stack className="container">
					<Stack className="main">
						<Stack className="left">
							<Box className="logo">
								<Image src="/img/logo/ijaraly2.svg" alt="Ijaraly" width={120} height={48} unoptimized />
								<span>Ijaraly</span>
							</Box>
							{renderContent()}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="join-page">
			<style>{otpStyles}</style>
			<Stack className="container">
				<Stack className="main">
					<Stack className="left">
						<Box className="logo">
							<Image src="/img/logo/ijaraly2.svg" alt="Ijaraly" width={120} height={48} unoptimized />
							<span>Ijaraly</span>
						</Box>
						{renderContent()}
					</Stack>
					<Stack className="right" />
				</Stack>
			</Stack>
		</Stack>
	);
};

/* ─── Scoped styles for OTP inputs + success animation ─── */
const otpStyles = `
.otp-inputs {
	display: flex;
	gap: 10px;
	justify-content: center;
	margin-top: 16px;
}
.otp-digit {
	width: 48px;
	height: 56px;
	text-align: center;
	font-size: 22px;
	font-weight: 600;
	border: 2px solid #ddd;
	border-radius: 10px;
	outline: none;
	transition: border-color 0.2s;
	font-family: inherit;
	caret-color: #eb6753;
}
.otp-digit:focus {
	border-color: #eb6753;
}
.auth-divider {
	display: flex;
	align-items: center;
	width: 100%;
	margin: 20px 0 16px;
}
.auth-divider::before,
.auth-divider::after {
	content: '';
	flex: 1;
	height: 1px;
	background: #e0e0e0;
}
.auth-divider span {
	padding: 0 14px;
	font-family: 'DM Sans', sans-serif;
	font-size: 13px;
	font-weight: 500;
	color: #999;
	text-transform: lowercase;
}
.success-check {
	display: flex;
	justify-content: center;
}
.success-check__circle {
	stroke-dasharray: 166;
	stroke-dashoffset: 166;
	stroke-width: 2;
	stroke-miterlimit: 10;
	stroke: #4bb71b;
	animation: sc-circle 0.6s ease-in-out forwards;
}
.success-check__tick {
	stroke-dasharray: 48;
	stroke-dashoffset: 48;
	stroke-width: 3;
	stroke-linecap: round;
	stroke-linejoin: round;
	stroke: #4bb71b;
	animation: sc-tick 0.3s 0.35s ease-in-out forwards;
}
@keyframes sc-circle {
	0% { stroke-dashoffset: 166; }
	100% { stroke-dashoffset: 0; }
}
@keyframes sc-tick {
	0% { stroke-dashoffset: 48; }
	100% { stroke-dashoffset: 0; }
}
`;

export default withLayoutBasic(Join);
