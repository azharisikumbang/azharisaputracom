---
title: "Belajar Database Transactions"
description: "Saat bertemu dengan query (manipulasi) yang cukup panjang dan kompleks terhadap database dan ingin memastikan setiap query dieksekusi tanpa kegagalan."
date: 2020-09-19
tags: posts
category: kode
category_url: kode/index.html
layout: post
permalink: kode/belajar-database-transactions-mysql.html
---

Dalam basis data, ada hal yang fundamental tapi terkadang suka dilewatkan oleh para punggawa teknologi ( biasanya punggawa baru yang lagi asik dengan gonta ganti bahasa pemrograman, termasuk saya), yups dialah database transaction. 

Meski sifatnya fundamental, tapi asal diketahui saja hal ini merupakan salah satu ilmu yang *wajib* bagi punggawa teknologi, terlebih  database administrator dan developer.  

## Konsep Database Transaction

Mungkin anda bertanya. kok thumbnail artikelnya gitu? Hmm; Apa hubunganya? Mirip mirip dengan konsep database transaction, di thumbnail tertulis '_double or nothing_', yang jika diterjemahkan penuhi dua kali lipat (seluruh permintaan) atau tidak sama sekali. (_ dan kita tau apa kelanjutannya.. duarrr; : v_ )

Begitu juga dengan transaction, transaction memberikan kita ruang untuk mengeksekusi _statement &#8211; statement _kita secara penuh dan jika berhasil akan `di-commit` atau jika gagal, seluruh _statement_ dianggap gagal, yang artinya kita akan dikembalika ke state awal atau `rollback`

Database akan menciptakan sebuah `consistent state`, misal `state1` kemudian mulai mengeksekusi transaksi dan diset ke `consistent state` baru, misal `state2` jika berhasil atau kembali ke `state1` jika gagal.

Jika belum jelas, kita ambil sebuah studi kasus, coba dibayangkan kita mempunyai sejumlah saldo di rekening bank ada dan berniat melakukan transfer ke rekening bank teman anda. Masing masing saldo diawal baik pengirim atau penerima berada pada situasi `consistent state`. Dan seharusnya bisa kita ambil statement atau langkah yang akan dijalankan sebagai berikut.

1. Kirim uang, saldo anda berkurang ( pengirim )
2. Uang diterima, saldo bertambah ( penerima )

Jika proses berjalan normal, maka akan dilakukan `commit` dan state akan berubah ke `consistent state` baru, yang artinya terjadi pengurangan saldo pada pengirim dan terjadi penambahan saldo pada penerima. 

Tapi.. bagaimana jika proses bermasalah, transfer sudah dilakukan dan catatan saldo pengirm sudah dikurangi (`statement1`), sedangkan server mengalami masalah, server error, overload, masalah jaringan atau semacamnya yang mengakibatkan `statement2` gagal dieksekusi dan saldo penerima pun tidak bertambah. Hhmm; ngeri kan? Hilang dah duit..

Oleh karena nya kita membutuhkan database transaction untuk mencegah hal hal demikian. Transaction akan secara otomatis membatalkan semua statement tadi, dan kembali ke `consistent state` awal tadi, dan saldo pun balik lagi 🙂

## Let's Try !
Ehh bentar, sebelum itu perlu disiapkan PHP dan MySQL karena akan bereksperimen pada keduanya, pertama hanya menggunakan MySQL dan kedua menggunakan keduanya. Jika belum punya, silahkan didownload dan install.

Perlu diketahui dan dipahami agar mudah dalam penerapannya, database transaction umum nya memiliki pattern berikut.

1. Inisialisasi atau Start Transaction
2. Eksekusi Statement atau Query
3. Melakukan Commit
4. Melakukan Rollback jika gagal

### MySQL
Masih dengan kasus yang sama pada contoh diatas, yakni proses transfer pada bank, dan silahkan login ke MySQL.

```shell
mysql -u <username> -p
```

Dan buat database denga nama `transaction`,

```sql
create database transaction;
use transaction;
```

Kemudian buat table dengan nama `balance_tbl` dan struktur berikut, jangan lupa enginenya kita pakai InnoDB ( seharusnya default ) karena support transaction.

```sql
create table `balance_tbl` (
`id` int unsigned primary key auto_increment,
`name` varchar(255),
`balance` decimal(12, 2) default 0
) engine=InnoDB ;
```

Selanjutnya kita coba masukkan data sample, misal 3 data saja

```sql
insert into `balance_tbl` values (null, 'Mipan', 1500000), (null, 'Zuzu', 2000000), (null, 'Yakakus', 1000000);
```

Harusnya data kita sebagai berikut,

```sql
mysql> select * from balance_tbl;
+----+---------+------------+
| id | name    | balance    |
+----+---------+------------+
|  1 | Mipan   | 1500000.00 |
|  2 | Zuzu    | 2000000.00 |
|  3 | Yakakus | 1000000.00 |
+----+---------+------------+
3 rows in set (0.00 sec)
```

Masih dengan kasus transfer diatas, misal kita melakukan transfer dari Mipan (id: 1) ke Zuzu (id: 2) sebesar Rp. 500.000 dan seharusnya Mipan mempunyai saldo baru senilai Rp, 1.000.000 dan Zuzu mempunyai saldo baru Rp. 2.500.000. ( `new consistent state` )

Secara query sebagai berikut. 

```sql
start transaction; # inisialisasi
update balance_tbl set balance = balance - 500000 where id = 1; # statemtnt 1
update balance_tbl set balance = balance + 500000 where id = 2; # statement 2
commit; # commit
```

Silahkan dicek lagi dan seharusnya data kita persis seperti yang kita inginkan. Tapi.. transaction nya mana? rollback nya mana? Mungkin terbesit dipikiran, karena memang kita tidak akan diberikan notifikasi khusus dari _mantan_, eh mysql maksudnya tentang transaction ini.

Lah.. truss.. taunya dari mana? Oke.. yok lebih intim.. ( dengan mysql )

Untuk dapat mengetahui nya kita butuh dua sesi yang berbeda, walaupaun  dengan mesin dan username yang sama. Silahkan buka sesi baru di command-line masing masing. Jadi, bayangan kita seharusnya database sedang diakses dari dau mesin yang berbeda.

> _Sepakat sesi pertama disebut `sesi1` dan sesi baru disebut `sesi2`_

Pada kedua sesi baik `sesi1` maupun `sesi2` silahkan select seluruh datanya, dan data tersebut harusnya sama dan ini lah `consistent state` nya.

```sql
# lakukan pada masing masing sesi
mysql> select * from balance_tbl;
+----+---------+------------+
| id | name    | balance    |
+----+---------+------------+
|  1 | Mipan   | 1000000.00 |
|  2 | Zuzu    | 2500000.00 |
|  3 | Yakakus | 1000000.00 |
+----+---------+------------+
3 rows in set (0.00 sec)

```

Oke.. pertama kita mulai dengan tanpa mendefenisikan transaction.

```sql
# Sesi1
update balance_tbl set balance = balance - 500000 where id = 1;
update balance_tbl set balance = balance + 500000 where id = 2;
```

Seharusnya, jika kita select pada masing masing sesi hasilnya sama sama barubah. ( kita sepakati sebagai `hasil1` )

```sql
mysql> select * from balance_tbl;
+----+---------+------------+
| id | name    | balance    |
+----+---------+------------+
|  1 | Mipan   |  500000.00 |
|  2 | Zuzu    | 3000000.00 |
|  3 | Yakakus | 1000000.00 |
+----+---------+------------+
3 rows in set (0.00 sec)
```

Kembali ke terminal `sesi1` kita coba melakukan query dengan transaction, *tapi tanpa commit* untuk bisa melihat perbedaannya.

```sql
# sesi1, sesi2 tidak perlu
start transaction;
update balance_tbl set balance = balance - 500000 where id = 1; 
update balance_tbl set balance = balance + 500000 where id = 2;  
```

Kemudian lakukan select data lagi pada masing masing sesi, `sesi1` dan `sesi2`, sudah ketauan perbedaannya ? ( kita tandai sebagai `hasil2` )

```sql
# sesi1
mysql> select * from balance_tbl;
+----+---------+------------+
| id | name    | balance    |
+----+---------+------------+
|  1 | Mipan   |       0.00 |
|  2 | Zuzu    | 3500000.00 |
|  3 | Yakakus | 1000000.00 |
+----+---------+------------+
3 rows in set (0.00 sec)
```

```sql
# sesi 2
mysql> select * from balance_tbl;
+----+---------+------------+
| id | name    | balance    |
+----+---------+------------+
|  1 | Mipan   |  500000.00 |
|  2 | Zuzu    | 3000000.00 |
|  3 | Yakakus | 1000000.00 |
+----+---------+------------+
3 rows in set (0.03 sec)

```

Oke.. sekarang coba pada `sesi1` ketikkan perintah `commit` dan select data pada masing masing sesi.

```sql
# sesi 1: ketikkan commit.
commit;
```

Dann.. seharusnya efek query kita baru terasa pada sesi lainnya apabila commit sudah eksekusi yang artinya menciptakan `consistent state` baru. Nah, hal ini lah yang terjadi pada transaction, terjadi isolasi pada sebuah transaction sampai proses tersebut betul betul selesai.

Tapi.. tapi rollbacknya mana? Mudah saja, jalankan kembali transaction nya tapi ganti commit dengan rollback lalu lihat state kedua sesi. 

Emm.. emm.. tanya satu lagi om.. Disitu Yakakus gunanya apa ? Gatau.. Gabut.. -_-

### PHP + MySQL
Kita coba implementasi ke bahasa pemrograman, disini saya contohkan pake PHP karena mudah dipahami., silahkan disesuaikan dengan bahasa lainnya. 

Oke, pada cerpen yang sudah dijelaskan diatas, sebenarnya ada satu hal ayng tidak saya sebutkan bahkan singgung, saya simpan agar tidak memecah konsentrasi, yaa karena lebih cocok disinggung di case kedua. hehe.. 🙂

> Setiap statement atau query sebenarnya sudah menerapkan transaction saat dieksekusi.

Jangan pusing, maksudnya pada setiap statement yang kita eksekusi sudah mengandung transaction, karena secara default sudah diaktifkan oleh mysql. Hal ini dikenal dengan fitur `autocommit`, hal ini bisa kita cek pada mysql kita dengan perintah.

```sql
mysql> select @@autocommit;
+--------------+
| @@autocommit |
+--------------+
|            1 |
+--------------+
1 row in set (0.06 sec)

# atau

mysql> show variables where variable_name='autocommit';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| autocommit    | ON    |
+---------------+-------+
1 row in set (0.01 sec)
```

Okey, status nya aktif, tapi maksudnya? Balik lagi ke konsep bagaimana transaction bekerja, yaitu jika sql berhasil maka commit dijalankan, dan sql statement terjadi error maka akan di-rollback ke kondisi terakhir. 

Truss.. bedanya pada pembahasan part MySQL di atas ?

Oke kita bahas pada contoh berikut sekalian implementasi dengan bahasa PHP. Tapi.. terlebih dahulu coba bayangkan ada 100 ribu baris data yang akan dimasukkan ke database pada satu waktu ( batch ). 

Yaa..tinggal masukkan.

Bukan itu.. jika kita memakai sql query yang menggunakan autocommit, bukan dengan transaction yang kita defenisikan secara manual ( grouping ), maka pada setiap sql statement yang dieksekusi akan menjalankan transaction masing masing, artinya 100 baris menjalankan 100 ribu transaction.

Bandingkan dengan, jika kita mendefenisikan transaction pada awal statement, yupps.. diluar menjaga `consistent state`, kita juga menjaga efisiensi, karena hanya perlu mengeksekusi satu kali transaction. 

Perbedaan akan sangat terlihat pada execution time.

Selanjut kita masuk ke script php, silahkan buat file `index.php` dan isikan seperti berikut ini. ( jangan lupa ganti username dan password )

```php
<?php
    
$dsn = "mysql:dbname=transaction;host:127.0.0.1";

try {
    $dbh = new \PDO($dsn, 'yourdbusername', 'yourdbpassword');	
} catch (\Exception $e) {
    throw new \Exception("Error : " . $e->getMessage(), 1);
}


try {

    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // init trasasction
    $dbh->beginTransaction();

    // statement
    for ($i=0; $i < 100000; $i++) { 
        $dbh->exec(
            "insert into balance_tbl (name, balance) values ('" . rand_string() . "', " . rand(100000, 999999999). " )"
        );	
    }

    // commit
    $dbh->commit();

} catch (Exception $e) {

    // rollback jika gagal
    $dbh->rollback();

    echo "Error : " . $e->getMessage();
}

function rand_string() {
    $string = random_bytes(8);
    return bin2hex($string);
}

echo "done..";
```

Sekarang mari jalankan `index.php` di command line, pastikan berada di direktori yang sama.

```bash
php index.php
```

Selanjutnya, setelah muncul tulisan _done_, masuk ke mysql cli lagi dan cek seharusnya telah ada 100 ribuan data disana.

Jika penasaran silahkan lakukan percobaan dengan tanpa menggunakan transaction dan lihat pebedaan pada waktu ekseskusi nya ( _gunakan microtime()_ )

Okee.. dari segi efisiensi kita telah sepakat bahwa harus menggunakan transaction secara manual unggul jauh.

Nah.. muncul pertanyaan baru.. konsistensi datanya nya gimana? Kan ada 100 ribu data tuh, seandainya kita test dengan menggunakan sesi seperti di part pembahasan MySQL hasilnya gimana? Silahkan dijawab sendiri.. karena harusnya sudah mengetahui jawabannya..

Pertanyaan lain.. seperti diterangkan pada part konsep transaction, kan saat proses pemasukan 100 ribu data ada waktu eksekusi yang memungkinkan adanya error yang terjadi seperti server error, jaringan bermasalah, kabel power server kesenggol kucing atau apalah yang memungkinkan statement kita tidak berhasil mencapai commit atau dieksekusi secara keseluruhan, misal dari 100 ribu row yang akan dimasukkan, hanya dicapai sampai 500. Nah, itu bagaimana?

Akan kita buktikan kesaktian trasaction..

Terlebih dahulu silahkan perhatikan total row yang ada pada table `balance` saat ini, kita anggap sebagai `consistent state`, atau untuk mempermudah bisa dikosongkan, terserah saja.

Selanjutnya eksekusi kembali script `index.php` di terminal,

```bash
php index.php
```

Dan, sebelum script 100% sukses dieksekusi, silahkan stop service mysql dengan command line atau bagi pengguna xampp silahkan dengan tombol stop. ( _*sambil berangan angan ini adalah kondisi urgent yang mangakibatkan server database nya bermasalah_ )

```bash
sudo service mysql stop
```

Harusnya, pada command line akan memunculkan pesan error berikut,

```bash
php index.php
Error : SQLSTATE[HY000]: General error: 2006 MySQL server has gone away..
```

Yang artinya, jika dengan transaction maka seharusnya transaction kita _tidak_ mencapai `commit` dan statenya harus `di-rollback`, tabel kita kembali ke keadaan semula.

Jika rajin, silahkan coba tanpa menggunakan transaction dan kill service mysql di saat proses query script ke database sedang berjalan. 

Dan cek, apa yang terjadi pada tabel serta temukan perbedaan.

Betul; seharusnya ada sebagian data yang berhasil masuk dan masalahnya anda akan dipusingkan dengan  mulai sibuk memisahkan data yang telah masuk dengan data yang belum masuk.. nambah kerjaan dan itu tidak keren.. 🙂

Mulai tergambarkan apa itu database transaction ? Jika belum, sing sabar. Terima kasih..

Referensi : 

* [https://en.wikipedia.org/wiki/Database\_transaction](https://en.wikipedia.org/wiki/Database_transaction)
* [https://software.endy.muhardin.com/java/database-transaction/](https://software.endy.muhardin.com/java/database-transaction/)
* [https://medium.com/gits-apps-insight/mengenal-konsep-database-transaction-bagian-1-54e66789f75e](https://medium.com/gits-apps-insight/mengenal-konsep-database-transaction-bagian-1-54e66789f75e)
* [https://dev.mysql.com/doc/refman/5.6/en/innodb-autocommit-commit-rollback.html](https://dev.mysql.com/doc/refman/5.6/en/innodb-autocommit-commit-rollback.html)
* [https://medium.com/@acep.abdurohman90/apa-itu-transactional-database-1891d44363d2](https://medium.com/@acep.abdurohman90/apa-itu-transactional-database-1891d44363d2)
* Diagram dibuat di [https://app.diagrams.net/](https://app.diagrams.net/)