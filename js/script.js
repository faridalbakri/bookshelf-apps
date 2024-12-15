document.addEventListener("DOMContentLoaded", function () {
  getBooksFromLocalStorage();
});

const inputBook = document.getElementById("inputBook");
inputBook.addEventListener("submit", function (event) {
  event.preventDefault();
  inputBooks();
});

document.addEventListener("render-book", function () {
  renderBooks();
});

const checklistBook = document.getElementById("inputBookIsComplete");
const buttonSubmit = document.getElementById("bookSubmit");
const spanButton = buttonSubmit.querySelector("span");

checklistBook.addEventListener("change", function () {
  if (checklistBook.checked) {
    spanButton.innerText = "selesai dibaca";
  } else {
    spanButton.innerText = "belum selesai dibaca";
  }
});

const searchForm = document.getElementById("searchBook");
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  searchBooks();
});

const resetButton = document.getElementById("reset");
resetButton.addEventListener("click", function (e) {
  const searchContainer = document.querySelector(".searchContainer");
  const searchInput = document.getElementById("searchBookTitle");
  searchContainer.style.display = "none";
  searchInput.value = "";
  e.preventDefault();
});

const books = [];
const RENDER_EVENT = "render-book";

function inputBooks() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = parseInt(document.getElementById("inputBookYear").value);
  const isCompleted = document.getElementById("inputBookIsComplete").checked;

  if (bookTitle === "" || bookAuthor === "" || isNaN(bookYear)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Semua data buku harus diisi!",
    });
    return;
  }

  const generatedID = generatedId();
  const bookObject = generatedBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    isCompleted
  );
  books.push(bookObject);

  saveBooksToLocalStorage();
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Tambahkan notifikasi SweetAlert
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Buku berhasil ditambahkan!",
    showConfirmButton: false,
    timer: 1500,
  });

  // Reset form input setelah sukses menambahkan
  document.getElementById("inputBook").reset();
}

function generatedId() {
  return +new Date();
}

function generatedBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
});

function searchBooks() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  const searchResults = books.filter((book) =>
    book.title.toLowerCase().includes(searchTitle)
  );
  displaySearchResults(searchResults);
}

function displaySearchResults(results) {
  const searchContainer = document.querySelector(".searchContainer");
  const contentResult = document.querySelector(".contentResult");
  const messageResult = document.getElementById("searchResults");
  messageResult.innerHTML = "";

  if (results.length === 0) {
    const noResultMessage = document.createElement("h3");
    noResultMessage.innerText = "Tidak ada buku yang cocok dengan pencarian.";
    messageResult.append(noResultMessage);

    contentResult.append(messageResult);
    searchContainer.style.display = "block";
    searchContainer.style.border = "1px solid black";
  } else {
    for (const bookItem of results) {
      const bookElement = makeBooks(bookItem);
      messageResult.append(bookElement);
      searchContainer.style.display = "block";
    }
  }
}

function renderBooks() {
  const uncompletedBook = document.getElementById("incompleteBookshelfList");
  uncompletedBook.innerHTML = "";

  const completedBook = document.getElementById("completeBookshelfList");
  completedBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBooks(bookItem);
    if (!bookItem.isCompleted) uncompletedBook.append(bookElement);
    else completedBook.append(bookElement);
  }
}

function makeBooks(bookObject) {
  const textTitle = document.createElement("h4");
  textTitle.innerText = "Title: " + bookObject.title;

  const textAuthor = document.createElement("h4");
  textAuthor.innerText = "Author: " + bookObject.author;

  const textYear = document.createElement("h4");
  textYear.innerText = "Year: " + bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("bookItem");
  container.append(textContainer);
  container.setAttribute("id", `books-${bookObject.id}`);

  const action = document.createElement("div");
  action.classList.add("action");
  container.append(action);

  if (bookObject.isCompleted) {
    const incompletedButton = document.createElement("button");
    incompletedButton.classList.add("green");
    incompletedButton.innerText = "Belum selesai dibaca";

    incompletedButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("red");
    removeButton.innerText = "Hapus buku";

    removeButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    action.append(incompletedButton, removeButton);
  } else {
    const completedButton = document.createElement("button");
    completedButton.classList.add("green");
    completedButton.innerText = "Selesai dibaca";

    completedButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const removeButton2 = document.createElement("button");
    removeButton2.classList.add("red");
    removeButton2.innerText = "Hapus buku";

    removeButton2.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    action.append(completedButton, removeButton2);
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  saveBooksToLocalStorage();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  // Tambahkan SweetAlert untuk konfirmasi
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Buku ini akan dihapus dan tidak bisa dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Hapus buku jika pengguna mengonfirmasi
      books.splice(bookTarget, 1);
      saveBooksToLocalStorage();
      document.dispatchEvent(new Event(RENDER_EVENT));

      // Tampilkan notifikasi bahwa buku telah dihapus
      Swal.fire({
        title: "Terhapus!",
        text: "Buku telah berhasil dihapus.",
        icon: "success",
      });
    }
  });
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  saveBooksToLocalStorage();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveBooksToLocalStorage() {
  localStorage.setItem("books", JSON.stringify(books));
}

function getBooksFromLocalStorage() {
  const booksJSON = localStorage.getItem("books");
  const storedBooks = JSON.parse(booksJSON);

  if (storedBooks) {
    books.length = 0;
    books.push(...storedBooks);

    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// sidebar
const navbar = document.querySelector(".navbar");
document.querySelector("#bars").onclick = () => {
  navbar.classList.toggle("active");
};

const bars = document.querySelector("#bars");
document.addEventListener("click", function (e) {
  if (!bars.contains(e.target) && !navbar.contains(e.target)) {
    navbar.classList.remove("active");
  }
});

$("#inputBookYear").datepicker({
  dateFormat: "dd-mm-yy",
  changeMouth: true,
  changeYear: true,
  yearRange: "-100:+10",
});
