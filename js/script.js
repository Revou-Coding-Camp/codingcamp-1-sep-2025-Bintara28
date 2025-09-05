// Mengambil elemen dari DOM
const form = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const formError = document.getElementById('form-error');
const listEl = document.getElementById('todo-list');
const emptyMessage = document.getElementById('empty-message');
const filterBtn = document.getElementById('filter-btn');
const clearFiltersBtn = document.getElementById('clear-filters');
const deleteAllBtn = document.getElementById('delete-all');

// Memuat todos dari localStorage atau array kosong
let todos = loadTodos();
// Variabel untuk menyimpan filter saat ini
let currentFilterText = '';
let currentFilterDate = '';

// Fungsi untuk menyimpan todos ke localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Fungsi untuk memuat todos dari localStorage
function loadTodos() {
    try {
        const raw = localStorage.getItem('todos');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
function isoToday() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Fungsi validasi input
function validate(title, date) {
    if (!title) return 'Task cannot be empty.';
    if (!date) return 'Please choose a date.';
    if (date < isoToday()) return 'Date cannot be in the past.';
    return null;
}

// Fungsi untuk me-render daftar todo
function render() {
    const text = currentFilterText.trim().toLowerCase();
    const fdate = currentFilterDate;

    // Filter todos berdasarkan teks dan tanggal
    const filtered = todos.filter(t => {
        const matchesText = t.title.toLowerCase().includes(text);
        const matchesDate = fdate ? t.date === fdate : true;
        return matchesText && matchesDate;
    });

    listEl.innerHTML = '';

    // Tampilkan pesan jika tidak ada tugas
    if (filtered.length === 0) {
        emptyMessage.textContent = todos.length === 0 ? "No tasks yet. Add one above" : "No tasks match your filter.";
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
    }
    
    // Tampilkan semua tugas yang sudah difilter
    for (const t of filtered) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = t.id;

        const left = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'todo-title';
        title.textContent = t.title;

        const date = document.createElement('div');
        date.className = 'todo-date';
        try {
            const d = new Date(t.date + 'T00:00');
            date.textContent = d.toLocaleDateString();
        } catch (e) {
            date.textContent = t.date;
        }

        left.appendChild(title);
        left.appendChild(date);

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.textContent = 'Delete';
        del.setAttribute('aria-label', `Delete task ${t.title}`);

        li.appendChild(left);
        li.appendChild(del);

        listEl.appendChild(li);
    }
}

// Fungsi untuk menambah todo
function addTodo(title, date) {
    const todo = {
        id: Date.now().toString(),
        title: title,
        date: date
    };
    todos.unshift(todo); // Tambah di awal array
    saveTodos();
    render();
}

// Fungsi untuk menghapus todo
function removeTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
}

// --- EVENT LISTENERS ---

// Listener untuk menambah todo (saat form disubmit)
form.addEventListener('submit', e => {
    e.preventDefault(); // Mencegah reload halaman
    formError.textContent = '';

    const title = todoInput.value.trim();
    const date = dateInput.value;

    const err = validate(title, date);
    if (err) {
        formError.textContent = err;
        return;
    }

    addTodo(title, date);
    form.reset(); // Mengosongkan input setelah submit
});

// Listener untuk tombol "Filter/Search"
filterBtn.addEventListener('click', () => {
    currentFilterText = todoInput.value;
    currentFilterDate = dateInput.value;
    render();
});

// Listener untuk tombol "Clear Filter"
clearFiltersBtn.addEventListener('click', () => {
    todoInput.value = '';
    dateInput.value = '';
    currentFilterText = '';
    currentFilterDate = '';
    render();
});

// Listener untuk tombol "Delete" pada setiap item
listEl.addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const li = e.target.closest('li');
        const id = li && li.dataset.id;
        if (!id) return;
        if (confirm('Delete this task?')) {
            removeTodo(id);
        }
    }
});

// Listener untuk tombol "Delete All"
deleteAllBtn.addEventListener('click', () => {
    if (todos.length === 0) return;
    if (confirm('Are you sure you want to delete all tasks?')) {
        todos = [];
        saveTodos();
        render();
    }
});

// Render awal saat halaman dimuat
render();