// ============================================= Custom ===========================================
function renderProduct(data) {
  let table = document.querySelector(".tableView .product-boby");
  if (!table) return;
  data = data
    .map((elm, index) => {
      return `    
      <div class="products-row">
        <div class="product-cell image">
            <img src="public/images/${elm.Img}">
        </div>
        <div class="product-cell name">
            ${elm.Ten}
        </div>
        <div class="product-cell category"><span class="cell-label">Category:</span>${elm.TenLoai}</div>
        <div class="product-cell provide"><span class="cell-label">ABCDD</span>${elm.TenTH}</div>

        <div class="product-cell price"><span class="cell-label">Price:</span>${elm.GIA} VNĐ</div>
        <div class="product-cell">
            <div style="display: flex;" class="handle-btn">
                <div style="padding: 10px;" class="edit-product" data-id="${elm.SP_ID}">
                    <i class="fa-regular fa-pen-to-square"></i>
                </div>
                <div style="padding: 10px;" class="remove-product" data-id="${elm.SP_ID}">
                    <i class="fa-regular fa-trash-can"></i>
                </div>
            </div>
        </div>
    </div>

        `;
    })
    .join(" ");
  table.innerHTML = data;
}

async function getListProduct() {
  let url = "/product";
  let res = await fetch(url, {
    method: "GET",
  });
  let data = await res.json();
  return data;
}
getListProduct()
  .then((res) => {
    renderProduct(res);
    return res;
  })
  .then((res) => {
    removeCart();
  })
  .then(function () {
    editProduct();
  });
async function removeCart() {
  let btnRemove = document.querySelectorAll(".remove-product");
  btnRemove.forEach((elm) => {
    elm.addEventListener("click", async function (e) {
      console.log(this.dataset.id);
      let req = await fetch(`/product/${this.dataset.id}`, {
        method: "DELETE",
      })
        .then((res) => res.text()) // or res.json()
        .then(() => {
          showSuccessToast();
        });
      this.parentNode.parentNode.parentNode.style.display = "none";
    });
  });
}

const getURLSearch = () => {
  let urlParams = new URLSearchParams(location.search);
  let arr = {};
  for (const [key, value] of urlParams) {
    {
      arr[key] = value;
    }
  }
  return arr;
};

async function editProduct() {
  let edit = document.querySelectorAll(".edit-product");
  let params = getURLSearch();
  edit.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      location.href = `${location.href}/edit?id=${this.dataset.id}`;
    });
  });
}

function showSuccessToast() {
  toast({
    title: "Thành công!",
    message: "Bạn đã xóa thành công",
    type: "success",
    duration: 1000,
  });
}
function toast({ title = "", message = "", type = "info", duration = 3000 }) {
  const main = document.getElementById("toast");
  if (main) {
    const toast = document.createElement("div");

    // Auto remove toast
    const autoRemoveId = setTimeout(function () {
      main.removeChild(toast);
    }, duration + 1000);

    // Remove toast when clicked
    toast.onclick = function (e) {
      if (e.target.closest(".toast__close")) {
        main.removeChild(toast);
        clearTimeout(autoRemoveId);
      }
    };

    const icons = {
      success: "fas fa-check-circle",
      info: "fas fa-info-circle",
      warning: "fas fa-exclamation-circle",
      error: "fas fa-exclamation-circle",
    };
    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);

    toast.classList.add("toast", `toast--${type}`);
    toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;

    toast.innerHTML = `
          <div class="toast__icon">
              <i class="${icon}"></i>
          </div>
          <div class="toast__body">
              <h3 class="toast__title">${title}</h3>
              <p class="toast__msg">${message}</p>
          </div>
          <div class="toast__close">
              <i class="fas fa-times"></i>
          </div>
      `;
    main.appendChild(toast);
  }
}
