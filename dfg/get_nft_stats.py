import requests

# Вставь сюда свой API-ключ, если он нужен
API_KEY = 'твой_ключ_здесь'

# URL для API-запроса
url = 'https://api.rarible.com/v0.1/stats'

# Отправка GET-запроса с API-ключом
response = requests.get(url, headers={'Authorization': f'Bearer {API_KEY}'})

# Проверка статуса ответа
if response.status_code == 200:
    data = response.json()  # Преобразуем ответ в формат JSON
    print(data)  # Выводим полученные данные
else:
    print(f"Ошибка {response.status_code}: {response.text}")
