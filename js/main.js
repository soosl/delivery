'use strict';

const cartButton = document.querySelector('#cart-button');
const modal = document.querySelector('.modal');
const buttonClose = document.querySelector('.close');
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('user');

const cart = [];


const saveCart = () => {
  localStorage.setItem(login, JSON.stringify(cart));
};

const loadCart = () => {
  if (localStorage.getItem(login)) {
    JSON.parse(localStorage.getItem(login)).forEach(function(item){
      cart.push(item);
    });
  }

};

const getData = async (url) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}!`);
  }
  
  return await response.json();
};

const valid = str => {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};


const toggleModal = () => {
  modal.classList.toggle('is-open');
};

const toggleModalAuth = () => {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle('is-open');
};

const returnMain = () => {
  containerPromo.classList.remove('hide');
  restaurants.classList.remove('hide');
  menu.classList.add('hide');
};

const authorized = () => {
  // console.log('Авторизован');

  const logOut = () => {
    login = null;
    localStorage.removeItem('user');
    cart.length = 0;

    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';

    buttonOut.removeEventListener('click', logOut);

    checkAuth();
    returnMain();
  };

  userName.textContent = login;

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';

  buttonOut.addEventListener('click', logOut);
  loadCart();
};

const notAuthorized = () => {
  // console.log('Не авторизован');

  const logIn = event => {
    event.preventDefault();

    if (valid(loginInput.value.trim())) {
      login = loginInput.value;

      localStorage.setItem('user', login);

      toggleModalAuth();

      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);

      logInForm.reset();

      checkAuth();
    } else {
      loginInput.style.borderColor = 'red';
    }
  };

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
};

const checkAuth = () => login ? authorized() : notAuthorized();

const createCardRestaurant = ({ image, kitchen, name, price, stars, products,
  time_of_delivery: timeOfDelivery }) => {

  const card = document.createElement('a');
  card.className = 'card card-restaurant';
  card.products = products;
  card.info = [name, price, stars, kitchen];

  card.insertAdjacentHTML('beforeend', `
                  <img src="${image}" alt="${name}" class="card-image"/>
                  <div class="card-text">
                    <div class="card-heading">
                      <h3 class="card-title">${name}</h3>
                      <span class="card-tag tag">${timeOfDelivery} мин</span>
                    </div>
                    <!-- /.card-heading -->
                    <div class="card-info">
                      <div class="rating">
                        ${stars}
                      </div>
                      <div class="price">От ${price} ₽</div>
                      <div class="category">${kitchen}</div>
                    </div>
                  </div>
 `);
  cardsRestaurants.insertAdjacentElement('beforeend', card);
};

const createCardGood = ({ description, image, name, price, id }) => {

  const card = document.createElement('div');
  card.className = 'card';

  card.insertAdjacentHTML('beforeend', `<img src="${image}" alt="image" class="card-image"/>
                    <div class="card-text">
                      <div class="card-heading">
                        <h3 class="card-title card-title-reg">${name}</h3>
                      </div>
                      <div class="card-info">
                        <div class="ingredients">${description}
                        </div>
                      </div>
                      <div class="card-buttons">
                        <button class="button button-primary button-add-cart" id=${id}>
                          <span class="button-card-text">В корзину</span>
                          <span class="button-cart-svg"></span>
                        </button>
                        <strong class="card-price card-price-bold">${price} ₽</strong>
                      </div>
                    </div>
  `);

  cardsMenu.insertAdjacentElement('beforeend', card);
};

const openGoods = event => {
  if (login) {
    const restaurant = event.target.closest('.card-restaurant');

    if (restaurant) {
      const [ name, price, stars, kitchen ] = restaurant.info;

      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₽`;
      category.textContent = kitchen;
      
      getData(`./db/${restaurant.products}`)
      .then(data => data.forEach(createCardGood));
    }
  } else {
    toggleModalAuth();
  }
};

const addToCart = (event) => {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');

  if(buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;
    const food = cart.find(item => item.id === id);

    if(food) {
      food.count += 1;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1
      });
    }
  }
  saveCart();
};

const renderCart = () => {
    modalBody.textContent = '';

    cart.forEach(function({ id, title, cost, count}){
      const itemCart = `
        <div class="food-row">
          <span class="food-name">${title}</span>
          <strong class="food-price">${cost}</strong>
          <div class="food-counter">
            <button class="counter-button counter-minus" data-id="${id}">-</button>
            <span class="counter">${count}</span>
            <button class="counter-button counter-plus" data-id="${id}">+</button>
          </div>
        </div>
      `;

      modalBody.insertAdjacentHTML('afterbegin', itemCart);
    });

    const totalPrice = cart.reduce(function(result, item){
      return result + (parseFloat(item.cost) * item.count);
    }, 0);

    modalPrice.textContent = totalPrice + ' ₽';
};

const changeCounter = event => {
  const target = event.target;
  if (target.classList.contains('counter-button')){
    const foodCount = cart.find(function(item){
      return item.id === target.dataset.id;
    });

    if (target.classList.contains('counter-minus')){
      foodCount.count--;
      if (foodCount.count === 0) {
        cart.splice(cart.indexOf(foodCount), 1);
      }
    }

    if (target.classList.contains('counter-plus')){
    foodCount.count++;
    }

    renderCart();
  }
  saveCart();
};

function init() {
  getData('./db/partners.json').then(data => data.forEach(createCardRestaurant));

  cartButton.addEventListener('click', renderCart);
  cartButton.addEventListener('click', toggleModal);

  buttonClearCart.addEventListener('click', () => {
    cart.length = 0;
    renderCart();
  });

  modalBody.addEventListener('click',changeCounter);

  cardsMenu.addEventListener('click', addToCart);
  
  buttonClose.addEventListener('click', toggleModal);
  
  cardsRestaurants.addEventListener('click', openGoods);
  
  logo.addEventListener('click', returnMain);

  inputSearch.addEventListener('keydown', event => {

    if (event.keyCode == 13) {
      const target = event.target;
      const value = target.value.toLowerCase().trim();
      target.value = '';
      const goods = [];

      if(!value || value.length < 3) {
        target.style.backgroundColor = 'tomato';
        setTimeout(function(){
          target.style.backgroundColor = '';
        }, 1000);
        return;
      }

      getData('./db/partners.json').then(function(data){

        const products = data.map(item => item.products);

        products.forEach(function(product){
          getData(`./db/${product}`).then(function(data){
            goods.push(...data);

            const searchGoods = goods
            .filter(item => item.name.toLowerCase().includes(value));

            cardsMenu.textContent = '';
            containerPromo.classList.add('hide');
            restaurants.classList.add('hide');
            menu.classList.remove('hide');
      
            restaurantTitle.textContent = 'Результаты поиска';
            rating.textContent = '';
            minPrice.textContent = '';
            category.textContent = '';

            return searchGoods;
          })
          .then(data => data.forEach(createCardGood));
        });

      });
    }
  });
  
  checkAuth();
  
}

var mySwiper = new Swiper('.swiper-container', {
  loop: true,
  autoplay: {
    delay: 3500
  }
});


init();