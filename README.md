# Typing Shooter 🎮

Аркадний тренажер швидкості друку українською/російською мовами.

## Можливості
- ⚡ 7 рівнів складності (адаптивна швидкість і слова)
- 🎯 Система комбо (до x10)
- 📊 Статистика в реальному часі (WPM, точність)
- 🎨 Неонова графіка з particle effects
- ❤️ 5 спроб (пропущене слово = -1 life)

## Локальний запуск

```bash
npm install
npm run dev
# відкрий http://localhost:5173
```

## Білд

```bash
npm run build
# готова папка dist/
```

## Деплой на DigitalOcean Droplet

```bash
# На сервері (один раз):
apt update && apt install -y nodejs npm nginx git
cd /var/www
git clone https://github.com/Maksetx/typing-shooter.git
cd typing-shooter
npm install && npm run build
cp nginx.conf /etc/nginx/sites-available/typing-shooter
ln -s /etc/nginx/sites-available/typing-shooter /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Оновлення (потім):
bash deploy.sh
```

## Як грати
1. Натисни СТАРТ
2. Друкуй слова що падають зверху
3. Перша буква вибирає слово — далі дідруковуй до кінця
4. Space / Enter — відмінити вибір слова
5. Backspace — видалити останню букву
