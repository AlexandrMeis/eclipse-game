import requests

# Вставь сюда свой API-ключ, если он нужен
API_KEY = "706fea4b-67c8-437f-ad55-c14581d2dae2"

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
