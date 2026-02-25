# reCAPTCHA v2 Checkbox Setup

The app uses **reCAPTCHA v2 Checkbox ("I'm not a robot")** for all form submissions (Login, Registration, and Resume Creation).

### 1. Google reCAPTCHA Admin Setup
- Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
- Create a new site.
- Select **reCAPTCHA v2** -> **"I'm not a robot" Checkbox**.
- Add your domains (e.g., `localhost` for testing).

### 2. Environment Variables (.env)
Update your `.env` file with the keys provided by Google:
```env
NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY=your_site_key
RECAPTCHA_V2_SECRET_KEY=your_secret_key
```

### 3. Usage in Frontend
Import and use the `RecaptchaV2Checkbox` component:
```tsx
import { RecaptchaV2Checkbox, type RecaptchaV2CheckboxHandle } from '../components/RecaptchaV2Checkbox';
const recaptchaRef = useRef<RecaptchaV2CheckboxHandle>(null);

// In your form
<RecaptchaV2Checkbox ref={recaptchaRef} />

// In handleSubmit
const token = recaptchaRef.current?.getToken();
```

### 4. Verification in Backend
All APIs use the `verifyRecaptchaV2Token` function from `lib/recaptcha.ts`.
```typescript
import { verifyRecaptchaV2Token } from '../../../lib/recaptcha';
const ok = await verifyRecaptchaV2Token(token);
```
