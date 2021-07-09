//В JS порядок записи такой: сперва идут переменные, потом функции, обработчики событий, вызов функций

const headerCityButton = document.querySelector('.header__city-button');
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');

let hash = location.hash.substring(1);

if(localStorage.getItem('lomoda-location')) {    //получаем данные из хранилища, используя ключ, и если мы их получили, то выводим в кнопку с выбором города
    headerCityButton.textContent = localStorage.getItem('lomoda-location'); //повторная запись нужна для того, чтобы проверить, есть ли там эти данные, а если данных там не окажется, то мы получим NaN и условие if не сработает
}

headerCityButton.addEventListener('click', () => {
    const city = prompt('Укажите ваш город');  // переменная city примет значение переменной headerCityButton
    headerCityButton.textContent = city;   // теперь данные с модального окна выведутся на страницу и вместо "укажите город" будет становиться запись того города, который написали. Это работа метода textContent, он отвечает за отображаемый текст
    localStorage.setItem('lomoda-location', city); // это хранилище браузера, теперь при перезагрузке стр указанный город не исчезнет ("укажите город"). Для работы с хранилищем нужно придумывать название ключа key (он пишется в скобочках после setItem), чтобы потом его использовать
});

// почистить localStorage можно в консоле, вкладка Application. Выбираем ссылку и удаляем, или выбираем CleanAll и удаляем все 

// localStorage для корзины

const getLocalStorage = () => JSON?.parse(localStorage.getItem('cart-lomoda')) || [];
const setLocalStorage = data => localStorage.setItem('cart-lomoda', JSON.stringify(data));

const renderCart = () => {
    cartListGoods.textContent = '';

    const cartItems = getLocalStorage();

    let totalPrice = 0;

    cartItems.forEach((item, i) => {

        const tr = document.createElement('tr');

        tr.innerHTML = 
        
        `
            <td>${i+1}</td>
            <td>${item.brand} ${item.name}</td>
            ${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
            ${item.size ? `<td>${item.size}</td>` : '<td>-</td>'}
            <td>${item.cost} &#8381;</td>
            <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
         `;

         totalPrice += item.cost;
         cartListGoods.append(tr)
    });

    cartTotalCost.textContent = totalPrice + '₽';
};


// блокировка скролла модального окна

const disableScroll = () => {
    const widthScroll = window.innerWidth - document.body.offsetWidth;

    document.body.dbScrollY = window.scrollY;

    document.body.style.cssText = `
        position: fixed;
        top: ${-window.scrollY}px;
        left: 0;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        padding-right: ${widthScroll}px;
    `;
};

const enableScroll = () => {
    document.body.style.cssText = '';
    window.scroll({
        top: document.body.dbScrollY,
    })
};


// браузерная объектная модель, делаем это для того, чтобы не скакал контент при скрытии скролла. У каждого браузера ширина скрольной полосы разная, делаем адаптивный код.
// код дословно читается так: ширина всей страницы (включая полосу прокрутки) минус ширину всей страницы (без прокрутки, только body)
// были использованы обратные кавычки, чтобы вставить переменную ширины полосы прокрутки, которою вычисляли выше




// Модальное окно

const subheaderCart = document.querySelector('.subheader__cart'); // селектор по классу передается с точкой
const cartOverlay = document.querySelector('.cart-overlay');

const cartModalOpen = () => {
    cartOverlay.classList.add('cart-overlay-open');  //открытие модального окна
    disableScroll();
    renderCart();
};

const cartModalClose = () => {
    cartOverlay.classList.remove('cart-overlay-open'); // закрытие модального окна. Но само по себе оно так работать не будет, нужно прописать условие, по которому это произойдет, пишем ниже - строка 70
    enableScroll();
};

subheaderCart.addEventListener('click', cartModalOpen);

cartOverlay.addEventListener('click', event => { // событие (event) при котором закроется модальное окно. Дословно функция читается так: к переменной cartOverlay добавляется событие клика, происходит событие event при котором происходит таргет (цель, выбор элемента на странице, в нашем случае это кнопка закрытия), дальше идет условие, что если пользователь нажал на кнопку закрытия, то запускается функция закрытия модального окна, которую мы написали выше.
    const target = event.target;

    if(target.classList.contains('cart__btn-close') || target.matches('.cart-overlay')) { // contains - это метод, который ищет среди всего документа определенный элемент, в нашем случает это кнопка. Т.е. если блок содержит этот класс, то функция будет работать. Тоже самое делает метот matches, только тут нужно ставить точку, если это класс, # и т.д.
        cartModalClose();
    }
}); // в данной функции мы прописали, что если нажимаем на кнопку закрытия или кликаем мимо модального окна в серый фон, то модальное окно закрывается


// база данных

const getData = async () => {   
    const data = await fetch('db.json');

    if (data.ok) {
        return data.json()
    } else {
        throw new Error(`Данные небыли получены, ошибка ${data.status} ${data.statusText}`)
    }
};

const getGoods = (callback, prop, value) => {
    getData()
        .then(data => {
            if (value) {
                callback(data.filter(item => item[prop] === value ))
            } else  {
                callback(data);
            }
        })
        .catch(err => {
            console.error(err);
        });
};



// Страница с товарами
// Конструкция try catch нужна для избежания ошибок при работе с выводом товара 



try {

    const goodsList = document.querySelector('.goods__list');

    if(!goodsList) {
        throw 'this is not a goods page'
    }

        //Переименование заголовков разделов товара, в зависимости от выбранной группы

        const goodsTitle = document.querySelector('.goods__title');
        const changeTitle = () => {
            goodsTitle.textContent = document.querySelector(`[href*="#${hash}"]`).textContent;
        };

        const createCard = ({ id, preview, cost, brand, name, sizes }) => {

        const li = document.createElement('li');

        li.classList.add('goods__item');

        li.innerHTML = `
            <article class="good">
            <a class="good__link-img" href="card-good.html#${id}">
                <img class="good__img" src="goods-image/${preview}" alt="">
            </a>
            <div class="good__description">
                <p class="good__price">${cost} &#8381;</p>
                <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                ${sizes ?
                     `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
                     ''}
                <a class="good__link" href="card-good.html#${id}">Подробнее</a>
            </div>
            </article>
        `;

        return li;
    };

    const renderGoodsList = data => {
        goodsList.textContent = '';

        data.forEach(item => {
            const card = createCard(item);
            goodsList.append(card);
        })
    };

    window.addEventListener('hashchange', () => {
        hash = location.hash.substring(1);
        changeTitle();
        getGoods(renderGoodsList, 'category', hash);
    })

    changeTitle();
    getGoods(renderGoodsList, 'category', hash);

} catch (err) {
    console.warn(err)
}

// Страница карточек товара

try{
    if(!document.querySelector('.card-good')) {
       throw 'this is not a card-good page';

    }

const cardGoodImage = document.querySelector('.card-good__image');
const cardGoodBrand = document.querySelector('.card-good__brand');
const cardGoodTitle = document.querySelector('.card-good__title');
const cardGoodPrice = document.querySelector('.card-good__price');
const cardGoodColor = document.querySelector('.card-good__color');
const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');
const cardGoodColorList = document.querySelector('.card-good__color-list');
const cardGoodSizes = document.querySelector('.card-good__sizes');
const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
const cardGoodBuy = document.querySelector('.card-good__buy');

const generatList = data => data.reduce((html, item, i) => html +
    `<li class="card-good__select-item" data-id="${i}">${item}</li>`, '')

const renderCardGood = ([{ id, brand, name, cost, color, sizes, photo }]) => {

    const data = { brand, name, cost, id };

    cardGoodImage.src = `goods-image/${photo}`;
    cardGoodImage.alt = `${brand} ${name}`
    cardGoodBrand.textContent = brand;
    cardGoodTitle.textContent = name;
    cardGoodPrice.textContent = `${cost} ₽`;
    if(color) {
        cardGoodColor.textContent = color[0];
        cardGoodColor.dataset.id = 0;
        cardGoodColorList.innerHTML = generatList(color);
    } else {
        cardGoodColor.style.display = 'none';
    }
    if(sizes) {
        cardGoodSizes.textContent = sizes[0];
        cardGoodSizes.dataset.id = 0;
        cardGoodSizesList.innerHTML = generatList(sizes);
    } else{
        cardGoodSizes.style.display = 'none';

    }

    cardGoodBuy.addEventListener('click', () => {
        if (color) data.color = cardGoodColor.textContent;
        if (sizes) data.size = cardGoodSizes.textContent;

        const cardData = getLocalStorage();
        cardData.push(data);
        setLocalStorage(cardData);
    });
};

cardGoodSelectWrapper.forEach(item => {
    item.addEventListener('click', e => {
        const target = e.target;

        if (target.closest('.card-good__select')) {
            target.classList.toggle('card-good__select__open');
        }

        if (target.closest('.card-good__select-item')) {
            const cardGoodSelect = item.querySelector('.card-good__select');
            cardGoodSelect.textContent = target.textContent;
            cardGoodSelect.dataset.id = target.dataset.id;
            cardGoodSelect.classList.remove('card-good__select__open');
           }
    });
});


getGoods(renderCardGood, 'id', hash);

} catch (err){
    console.warn(err);
}
