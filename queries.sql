create table books (
    id serial PRIMARY KEY,
    title varchar(100) not null,
    author varchar(50),
    synopsis varchar(500) not null,
    isbn varchar(50) not null
);

create table reviews (
    id serial PRIMARY KEY,
    review varchar(100) not null,
    book_id int not null references books on delete cascade,
    rating int not null,
    constraint fk_book
    foreign key(book_id) references books(id)
);

insert into books(title, author, synopsis, isbn) values ('Vedic astrology', 'Komilla Sutton', 'A basic introduction to the science and art of Jyotish by a prominent English Jyotishi.', '1885585799'), ('Astrology for the soul', 'Jan Spiller', 'Astrologer Jan Spiller shows you the key to discovering your hidden talents, your deepest desires, and the ways you can avoid negative influences.',  '9780553378382'), ('Tao te ching', 'Laozi', 'Tao Te Ching is rife with terms and expressions that have no exact counterpart in English.', '0486297926'), ('Animal Farm', 'George Orwell', 'Animal Farm is a brilliant political satire and a powerful and affecting story of revolutions and idealism, power and corruption.', '9781472133052');

insert into reviews(review, book_id, rating) values ('Interesting read.', 1, 4), ('Know more about my astrology sign.', 2, 6), ('Many of his thoughts helps me to think more.', 3, 7), ('Haha! Funny story.', 4, 7), ('I knows my signs', 1, 3);

select * from books join reviews on books.id = reviews.book_id;

// group book reviews according book_id
select books.title, books.author, array_agg(reviews.review) as reviews from books join reviews on books.id = reviews.book_id group by books.id;