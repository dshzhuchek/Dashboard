class WidgetManager {
            constructor() {
                this.dashboard = document.getElementById('dashboard');
                this.availableWidgets = document.getElementById('availableWidgets');
                this.statusMessage = document.getElementById('statusMessage');
                this.widgets = [];
                this.availableWidgetTypes = [
                    { 
                        id: 'weather', 
                        name: 'Погода в СПб', 
                        api: 'https://api.open-meteo.com/v1/forecast?latitude=59.94&longitude=30.31&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m',
                        icon: '🌤️'
                    },
                    { 
                        id: 'population', 
                        name: 'Демография России', 
                        api: 'https://restcountries.com/v3.1/name/russia',
                        icon: '🇷🇺'
                    },
                    { 
                        id: 'space', 
                        name: 'Космонавты на МКС', 
                        api: 'http://api.open-notify.org/astros.json',
                        icon: '🚀'
                    },
                    { 
                        id: 'jokes', 
                        name: 'Случайные шутки', 
                        api: 'https://official-joke-api.appspot.com/random_joke',
                        icon: '😂'
                    },
                    { 
                        id: 'cats', 
                        name: 'Факты о котах', 
                        api: 'https://catfact.ninja/fact',
                        icon: '😺'
                    },
                    { 
                        id: 'time', 
                        name: 'Время в Москве', 
                        api: 'https://worldtimeapi.org/api/timezone/Europe/Moscow',
                        icon: '⏰'
                    },
                    { 
                        id: 'quotes', 
                        name: 'Случайные цитаты', 
                        api: 'https://api.quotable.io/random',
                        icon: '💭'
                    },
                    { 
                        id: 'facts', 
                        name: 'Интересные факты', 
                        api: 'https://uselessfacts.jsph.pl/random.json?language=ru',
                        icon: '🔍'
                    }
                ];
                
                this.init();
            }

            init() {
                this.loadDashboard();
                
                if (this.widgets.length === 0) {
                    const initialWidgets = this.availableWidgetTypes.slice(0, 3);
                    initialWidgets.forEach(widgetType => {
                        this.addWidgetToDashboard(widgetType);
                    });
                }
                
                this.renderAvailableWidgets();
            }

            saveDashboard() {
                try {
                    const config = {
                        widgets: this.widgets.map(widget => ({
                            type: widget.type,
                            name: widget.name,
                            api: widget.api,
                            icon: widget.icon
                        })),
                        timestamp: new Date().toISOString()
                    };
                    
                    localStorage.setItem('dashboardConfig', JSON.stringify(config));
                    this.showStatus('🎀 Конфигурация сохранена!', 'success');
                } catch (error) {
                    this.showStatus('❌ Ошибка сохранения', 'error');
                }
            }

            loadDashboard() {
                try {
                    const savedConfig = localStorage.getItem('dashboardConfig');
                    if (savedConfig) {
                        const config = JSON.parse(savedConfig);
                        this.widgets = [];
                        this.dashboard.innerHTML = '';
                        
                        config.widgets.forEach(widgetConfig => {
                            const widgetType = this.availableWidgetTypes.find(
                                type => type.id === widgetConfig.type
                            );
                            if (widgetType) {
                                this.addWidgetToDashboard(widgetType);
                            }
                        });
                        
                        this.showStatus('🌸 Конфигурация загружена!', 'success');
                    }
                } catch (error) {
                    this.showStatus('❌ Ошибка загрузки', 'error');
                }
            }

            resetDashboard() {
                if (confirm('Вы уверены, что хотите сбросить конфигурацию дашборда?')) {
                    localStorage.removeItem('dashboardConfig');
                    
                    this.widgets = [];
                    this.dashboard.innerHTML = '';
                    
                    const initialWidgets = this.availableWidgetTypes.slice(0, 3);
                    initialWidgets.forEach(widgetType => {
                        this.addWidgetToDashboard(widgetType);
                    });
                    
                    this.renderAvailableWidgets();
                    this.showStatus('🔄 Конфигурация сброшена!', 'success');
                }
            }

            showStatus(message, type) {
                this.statusMessage.textContent = message;
                this.statusMessage.className = `status-message status-${type}`;
                this.statusMessage.classList.add('show');
                
                setTimeout(() => {
                    this.statusMessage.classList.remove('show');
                }, 3000);
            }

            async fetchData(apiUrl, widgetType) {
                try {
                    switch(widgetType) {
                        case 'weather':
                            return await this.fetchWeather(apiUrl);
                        case 'population':
                            return await this.fetchPopulation(apiUrl);
                        case 'space':
                            return await this.fetchSpace(apiUrl);
                        case 'jokes':
                            return await this.fetchJokes(apiUrl);
                        case 'cats':
                            return await this.fetchCatFacts(apiUrl);
                        case 'time':
                            return await this.fetchWorldTime(apiUrl);
                        case 'quotes':
                            return await this.fetchQuotes(apiUrl);
                        case 'facts':
                            return await this.fetchRandomFacts(apiUrl);
                        default:
                            return 'Данные не доступны';
                    }
                } catch (error) {
                    return '<div class="error">Ошибка загрузки данных</div>';
                }
            }

            getWeatherDescription(code) {
                const weatherCodes = {
                    0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность',
                    3: 'Пасмурно', 45: 'Туман', 48: 'Туман с инеем',
                    51: 'Легкая морось', 53: 'Умеренная морось', 55: 'Сильная морось',
                    61: 'Небольшой дождь', 63: 'Умеренный дождь', 65: 'Сильный дождь',
                    80: 'Ливень', 95: 'Гроза'
                };
                return weatherCodes[code] || 'Неизвестно';
            }

            async fetchWeather(apiUrl) {
                const response = await fetch(apiUrl);
                const data = await response.json();
                const weather = data.current_weather;
                
                return `
                    <div class="weather-info">
                        <div style="font-weight: 600; margin-bottom: 15px; color: var(--dark-pink);">Санкт-Петербург</div>
                        <div class="weather-temp">${weather.temperature}°C</div>
                        <div style="margin-bottom: 20px; font-size: 18px;">${this.getWeatherDescription(weather.weathercode)}</div>
                        <div class="weather-details">
                            <div class="weather-detail">
                                <div>💨 Ветер</div>
                                <div>${weather.windspeed} км/ч</div>
                            </div>
                            <div class="weather-detail">
                                <div>🧭 Направление</div>
                                <div>${weather.winddirection}°</div>
                            </div>
                            <div class="weather-detail">
                                <div>🌡️ Ощущается</div>
                                <div>${weather.temperature}°C</div>
                            </div>
                            <div class="weather-detail">
                                <div>🕐 Обновлено</div>
                                <div>${new Date().toLocaleTimeString('ru-RU').slice(0, 5)}</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            async fetchPopulation(apiUrl) {
                const response = await fetch(apiUrl);
                const data = await response.json();
                const country = data[0];
                
                return `
                    <div style="text-align: center;">
                        <div class="emoji-large">${country.flag || '🇷🇺'}</div>
                        <div style="font-weight: 600; margin-bottom: 15px; color: var(--dark-pink);">${country.name.common}</div>
                        <div class="data-highlight">${(country.population / 1000000).toFixed(1)} млн</div>
                        <div class="fact-box">
                            <div><strong>Столица:</strong> ${country.capital[0]}</div>
                            <div><strong>Регион:</strong> ${country.region}</div>
                            <div><strong>Площадь:</strong> ${(country.area / 1000000).toFixed(1)} млн км²</div>
                        </div>
                    </div>
                `;
            }

            async fetchSpace(apiUrl) {
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                return `
                    <div style="text-align: center;">
                        <div class="emoji-large">🚀</div>
                        <div style="font-weight: 600; margin-bottom: 15px; color: var(--dark-pink);">Космонавты на МКС</div>
                        <div class="data-highlight pulse">${data.number}</div>

                        <div style="margin-bottom: 20px;">человек в космосе</div>
                        <div class="fact-box">
                            ${data.people.slice(0, 5).map(astronaut => `
                                <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 8px; height: 8px; background: var(--primary-pink); border-radius: 50%;"></div>
                                    <div>${astronaut.name}</div>
                                </div>
                            `).join('')}
                            ${data.number > 5 ? `<div style="color: var(--light-pink); font-size: 14px; margin-top: 10px;">... и еще ${data.number - 5}</div>` : ''}
                        </div>
                    </div>
                `;
            }

            async fetchJokes(apiUrl) {
                const russianJokes = [
                    { setup: "Почему программисты путают Хэллоуин и Рождество?", punchline: "Потому что Oct 31 == Dec 25" },
                    { setup: "Сколько программистов нужно, чтобы вкрутить лампочку?", punchline: "Ни одного, это аппаратная проблема!" },
                    { setup: "Что говорит программист, когда ему жарко?", punchline: "Откройте windows!" }
                ];
                
                const joke = russianJokes[Math.floor(Math.random() * russianJokes.length)];
                
                return `
                    <div style="text-align: center; padding: 10px;">
                        <div class="emoji-large">😂</div>
                        <div style="font-weight: 600; margin-bottom: 20px; color: var(--dark-pink);">Программистская шутка</div>
                        <div class="fact-box">
                            <div style="font-style: italic; margin-bottom: 15px;">${joke.setup}</div>
                            <div style="color: var(--primary-pink); font-weight: 600; font-size: 18px;">${joke.punchline}</div>
                        </div>
                        <div style="margin-top: 20px; font-size: 12px; color: var(--light-pink);">Обновлено: ${new Date().toLocaleTimeString('ru-RU')}</div>
                    </div>
                `;
            }

            async fetchCatFacts(apiUrl) {
                const russianFacts = [
                    "Кошки спят в среднем 12-16 часов в день",
                    "У кошек более 300 миллионов обонятельных рецепторов",
                    "Кошки могут поворачивать уши на 180 градусов",
                    "Сердце кошки бьется почти в два раза быстрее человеческого",
                    "Кошки не чувствуют сладкий вкус",
                    "Усы кошек помогают им ориентироваться в пространстве",
                    "Кошки могут прыгать на высоту в 5-6 раз больше своего роста"
                ];
                
                const fact = russianFacts[Math.floor(Math.random() * russianFacts.length)];
                
                return `
                    <div style="text-align: center;">
                        <div class="emoji-large">😺</div>
                        <div style="font-weight: 600; margin-bottom: 20px; color: var(--dark-pink);">Факт о котах</div>
                        <div class="fact-box">
                            <div style="line-height: 1.6; font-size: 16px;">${fact}</div>
                        </div>
                        <div style="margin-top: 15px; display: flex; justify-content: center; gap: 20px; color: var(--light-pink); font-size: 14px;">
                            <span>Длина: ${fact.length} символов</span>
                            <span>•</span>
                            <span>Обновлено: ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                `;
            }

            async fetchWorldTime(apiUrl) {
                try {
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    
                    const cities = [
                        { name: "🇷🇺 Москва", time: new Date(data.datetime).toLocaleTimeString('ru-RU') },
                        { name: "🇺🇸 Нью-Йорк", time: new Date().toLocaleTimeString('ru-RU', { timeZone: 'America/New_York' }) },
                        { name: "🇬🇧 Лондон", time: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/London' }) },
                        { name: "🇯🇵 Токио", time: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Asia/Tokyo' }) },
                        { name: "🇦🇺 Сидней", time: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Australia/Sydney' }) },
                        { name: "🇫🇷 Париж", time: new Date().toLocaleTimeString('ru-RU', { timeZone: 'Europe/Paris' }) }
                    ];
                    
                    return `
                        <div>
                            <div style="text-align: center; margin-bottom: 20px;">
                                <div class="emoji-large">⏰</div>
                                <div style="font-weight: 600; color: var(--dark-pink);">Время по миру</div>
                            </div>
                            ${cities.map(city => `
                                <div class="time-zone">
                                    <div class="city-name">
                                        <span style="font-size: 20px;">${city.name.split(' ')[0]}</span>
                                        <span>${city.name.split(' ')[1]}</span>
                                    </div>
                                    <div style="font-weight: 600; color: var(--dark-pink); font-size: 18px;">
                                        ${city.time.slice(0, 5)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } catch (error) {
                    const now = new Date();
                    return `
                        <div style="text-align: center;">
                            <div class="emoji-large">⏰</div>
                            <div style="font-weight: 600; margin-bottom: 20px; color: var(--dark-pink);">Текущее время</div>
                            <div class="data-highlight">${now.toLocaleTimeString('ru-RU').slice(0, 5)}</div>
                            <div style="margin: 15px 0; color: var(--text-light);">${now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    `;
                }
            }

            async fetchQuotes(apiUrl) {
                try {
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    
                    return `
                        <div style="text-align: center;">
                            <div class="emoji-large">💭</div>
                            <div style="font-weight: 600; margin-bottom: 20px; color: var(--dark-pink);">Случайная цитата</div>
                            <div class="fact-box">
                                <div style="font-style: italic; line-height: 1.6; margin-bottom: 15px;">"${data.content}"</div>
                                <div style="font-weight: 600; color: var(--primary-pink);">— ${data.author}</div>
                            </div>
                            <div style="margin-top: 15px; font-size: 12px; color: var(--light-pink);">
                                Теги: ${data.tags.join(', ')}
                            </div>
                        </div>
                    `;
                } catch (error) {
                    const quotes = [
                        { content: "Единственный способ делать великие дела — это любить то, что вы делаете", author: "Стив Джобс" },
                        { content: "Настоящее программирование — это не написание кода, а решение проблем", author: "Неизвестный программист" },
                        { content: "Учиться — это значит открывать то, что ты уже знаешь", author: "Ричард Бах" }
                    ];
                    const quote = quotes[Math.floor(Math.random() * quotes.length)];
                    
                    return `
                        <div style="text-align: center;">
                            <div class="emoji-large">💭</div>
                            <div style="font-weight: 600; margin-bottom: 20px; color: var(--dark-pink);">Случайная цитата</div>
                            <div class="fact-box">
                                <div style="font-style: italic; line-height: 1.6; margin-bottom: 15px;">"${quote.content}"</div>
                                <div style="font-weight: 600; color: var(--primary-pink);">— ${quote.author}</div>
                            </div>
                        </div>
                    `;
                }
            }

            async fetchRandomFacts(apiUrl) {
                try {
                    const response = await fetch(apiUrl);
                    const data = await response.json();
                    
                    return `
                        <div style="text-align: center;">
                            <div class="emoji-large">🔍</div>
                            <div style="font-weight: 600; margin-bottom: 20px; color: var(--dark-pink);">Интересный факт</div>
                            <div class="fact-box">
                                <div style="line-height: 1.6; font-size: 16px;">${data.text}</div>
                            </div>
                            <div style="margin-top: 15px; font-size: 12px; color: var(--light-pink);">
                                Источник: Useless Facts API
                            </div>
                        </div>
                    `;
                } catch (error) {
                    const facts = [
                        "Мед никогда не портится. Археологи находили мед в египетских гробницах, который был все еще съедобен",
                        "Сердце кита бьется всего 9 раз в минуту",
                        "Осьминоги имеют три сердца и голубую кровь",
                        "Бананы - это ягоды, а клубника - нет"
                    ];
                    const fact = facts[Math.floor(Math.random() * facts.length)];
                    
                    return `
                        <div style="text-align: center;">
                            <div class="emoji-large">🔍</div>
                            <div style="font-weight: 600; margin-bottom: 20px; color: var(--dark-pink);">Интересный факт</div>
                            <div class="fact-box">
                                <div style="line-height: 1.6; font-size: 16px;">${fact}</div>
                            </div>
                        </div>
                    `;
                }
            }

            createWidget(widgetType) {
                const widget = {
                    id: Date.now() + Math.random(),
                    type: widgetType.id,
                    name: widgetType.name,
                    api: widgetType.api,
                    icon: widgetType.icon
                };

                const widgetElement = document.createElement('div');
                widgetElement.className = 'widget';
                widgetElement.dataset.widgetId = widget.id;

                widgetElement.innerHTML = `
                    <div class="widget-header">
                        <div class="widget-title">
                            ${widget.icon} ${widget.name}
                        </div>
                        <div class="widget-controls">
                            <button class="btn btn-update" onclick="widgetManager.updateWidget('${widget.id}')">
                                🔄
                            </button>
                            <button class="btn btn-remove" onclick="widgetManager.removeWidget('${widget.id}')">
                                ❌
                            </button>
                        </div>
                    </div>
                    <div class="widget-content">
                        <div class="loading">Загрузка данных...</div>
                    </div>
                `;

                return { widget, element: widgetElement };
            }

            async addWidgetToDashboard(widgetType) {
                const { widget, element } = this.createWidget(widgetType);
                this.widgets.push(widget);
                this.dashboard.appendChild(element);
                
                await this.loadWidgetData(widget.id);
                this.renderAvailableWidgets();
                
                this.saveDashboard();
            }

            async loadWidgetData(widgetId) {
                const widget = this.widgets.find(w => w.id == widgetId);
                if (!widget) return;

                const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"] .widget-content`);
                if (widgetElement) {
                    try {
                        const content = await this.fetchData(widget.api, widget.type);
                        widgetElement.innerHTML = content;
                    } catch (error) {
                        widgetElement.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
                    }
                }
            }

            async updateWidget(widgetId) {
                const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"] .widget-content`);
                if (widgetElement) {
                    widgetElement.innerHTML = '<div class="loading">Обновление данных...</div>';
                    await this.loadWidgetData(widgetId);
                    this.showStatus('🔄 Виджет обновлен!', 'success');
                }
            }

            removeWidget(widgetId) {
                const widgetIndex = this.widgets.findIndex(w => w.id == widgetId);
                if (widgetIndex > -1) {
                    this.widgets.splice(widgetIndex, 1);
                    const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`);
                    if (widgetElement) {
                        widgetElement.style.animation = 'fadeIn 0.3s reverse';
                        setTimeout(() => widgetElement.remove(), 300);
                    }
                    this.renderAvailableWidgets();
                    this.saveDashboard();
                    this.showStatus('🗑️ Виджет удален', 'success');
                }
            }

            renderAvailableWidgets() {
                this.availableWidgets.innerHTML = '';

                const usedTypes = new Set(this.widgets.map(w => w.type));
                const availableTypes = this.availableWidgetTypes.filter(type => !usedTypes.has(type.id));

                if (availableTypes.length === 0) {
                    const message = document.createElement('div');
                    message.className = 'available-widget-item';
                    message.innerHTML = `
                        <h3>🎉 Все виджеты добавлены!</h3>
                        <p style="color: var(--light-pink); margin: 10px 0;">Удалите некоторые виджеты, чтобы добавить новые</p>
                    `;
                    this.availableWidgets.appendChild(message);
                    return;
                }

                availableTypes.forEach(widgetType => {
                    const widgetItem = document.createElement('div');
                    widgetItem.className = 'available-widget-item';
                    widgetItem.innerHTML = `
                        <h3>${widgetType.icon} ${widgetType.name}</h3>
                        <button class="btn btn-add" onclick="widgetManager.addWidgetToDashboard(widgetManager.availableWidgetTypes.find(w => w.id === '${widgetType.id}'))">
                            ➕ Добавить на дашборд
                        </button>
                    `;
                    this.availableWidgets.appendChild(widgetItem);
                });
            }
        }

        const widgetManager = new WidgetManager();
        
        // Автоматическое обновление виджетов каждые 5 минут
        setInterval(() => {
            widgetManager.widgets.forEach(widget => {
                widgetManager.updateWidget(widget.id);
            });
        }, 5 * 60 * 1000);