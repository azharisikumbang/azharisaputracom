---
title: "Subnetting: Ada banyak caranya.."
description: "Ada beberapa cara untuk melakukan subneting, ada dengan menggunakan binery ataupun dengan cara khusus. Sangat perlu ketika malas buka ip calc :v"
date: 2020-12-15
tags: posts
category: jaringan
category_url: jaringan/index.html
layout: post
permalink: jaringan/subnetting-cara-mudah.html # change
---

Sekian lama tidak menulis tentang jaringan (_daku sudah lupa_) dan kebetulan lagi bahas binary di kampus, kali ini kita akan kembali membahas jaringan dan yang paling fundamental dan membosankan, yaitu _subnetting_.

Sedikit teori, subnetting merupakan metode yang digunakan untuk membagi-bagi jaringan kebagian bagian yang lebih kecil, jadi untuk manajemen lebih mudah dan terkontrol.

Nah, dahulu kala _sebelum negara api menyerang_, biasanya cara subnetting dengan menggunakan bantuan CIDR ( _Classless Inter-Domain Routing_ ) dan mengkonversikannya ke binary, dan jujur itu sangat melelahkan, tapi jangan khawatir dengan metode sakti ini kita tidak akan menyentuh binary, jadi tidak ada lagi angka 0101010 itu.

Tapi, tunggu dulu mungkin binary kita lupakan sedangkan CIDR tetap kita gunakan dan tetap pahami juga tentang kelas kelas IP, kelas A, kelas B dan kelas C, walaupun tidak akan secara spesifik disinggung di tutorial ini tetapi itu sangat diperlukan.

## Persiapan

Sebelum mulai, perlu beberapa byte memori di otak kita untuk mengingat beberapa hal berikut.

### Tabel Bantu

Tanpa mengurangi rasa hormat, izinkan saya menyuruh anda untuk mengetahui tabel berikut.

| Prefiks | Kunci |
|---------|-------|
| /32     | 1     |
| /31     | 2     |
| /30     | 4     |
| /29     | 8     |
| /28     | 16    |
| /27     | 32    |
| /26     | 64    |
| /25     | 128   |

_Si Joni : Mudah apanya ngapal banyak gitu?_

(_Protes truss_). Memang banyak, tapi agar tidak menjadi kebingunan ini tabel darimana dan kenapa perlu dipahami. Jadi, kolom di sebelah kiri selanjutnya akan ita sebut prefiks, apa itu ? ( google it) . Sedangkan table sebelah kanan sebenarnya adalah representasi jumlah ip dari sebuah subnet yang selanjutnya akan kita gunkanan sebagai kunci.

_Sedikit informasi, setelah berdebat dengan si Joni, akhirnya kami memutuskan untuk mengurangi tabel menjadi tiga baris saja agar mudah diingat._

| Prefiks | Kunci |
|---------|-------|
| /30     | 4     |
| /28     | 16    |
| /26     | 64    |

Sekarang tinggal tiga baris, jadi akan lebih mudah untuk mengingat kunci. Tapi bagaimana untuk mengingat sisanya? Mudah saja, ambil satu kunci terdekat, jika prefiks angka nya lebih kecil maka kunci bagi 2 ( kunci / 2) dan jika lebih besar maka kalikan 2 ( kunci \* 2). Misal, jika /28 kunci nya adalah 16, maka /29 kunci nya adalah 16 / 2 = 8

### Oktet

Seperti kita ketahui ip address memiliki panjang 32 bit, dan dibagian ke dalam 4 oktet masing masing 8 bit ( 1 byte ).
```plain
192.168.100.1 ( decimal format )
11000000.10101000.01100100.00000001 ( binary format )
    |       |        |        |
    |       |        |        |
 oktet4   oktet3   oktet2   oktet1
```   

Karya sederhana di atas akan selanjutnya menjadi patokan saat saat melakukan pengambilan oktet, kenapa? Karena ada beberapa versi dimana oktet pertama dimulai dari kiri seperti saat kita membaca bilangan desimal.

Setelah mengetahui oktet, ada beberapa aturan sederhana yang perlu diketahui:

*   jika prefiks antara /1 – /8, maka kita beroperasi di oktet4
*   jika prefiks antara /9 – /16, maka kita beroperasi di oktet3
*   jika prefiks antara /17 – /24, maka kita beroperasi di oktet2
*   jika prefiks antara /25 – /32, maka kita beroperasi di oktet1

## Let’s Go

Setelah mengetahui hal di atas, mari kita selesaikan satu beberapa contoh kasus.


```plain
Misal IP => 192.168.88.99/26

Hitung : 
- Network 
- Broadcast
- Netmask
- Range Ip
- Jumlah Host
```

### Mencari Kunci

Langkah pertama kita butuh mengintip kembali ke table di atas, saya tau anda tidak ingat, karena saya juga, bahwa `prefiks /26` mempunya angka `kunci` sekaligus `jumlah ip` adalah `64`. _( \*silahkan diingat )_

```plain
Kunci => 64 ( prefiks /26 )
```

### Mencari Letak Oktet

Masih melibatkan prefiks, untuk mencari letak oktet silahkan cek lagi aturan oktet diatas, dimana prefiks /26 berada pada aturan antara `/25 – /32` yang artinya berada pada oktet ke 1 (oktet1), yang artinya kita akan beroperasi di oktet ini.

Setelah mengetahui posisi oktet, kita perlu melihat lagi ke ip yang diberikan, dimana oktet ke 1 memiliki angka nya adalah `99`.

```plain
Ip : 192.168.88.99/26

angka operasi => 99 (oktet1)
```

### Network

Selanjutnya kita perlu mengetahui ip kita berada pada posisi subnet ke berapa pada kemungkinan subnet yang akan dibentuk, karena sesuai tujuan subneting membentuk jaringan menjadi bentuk yang lebih kecil.

Untuk mengetahui posisinya, kita memerlukakan `angka di oktet` yang telah kita dapatkan sebelumnya yaitu `99` kemudian `membagikannya` dengan `angka kunci`, yaitu `64`.

```plain
angkat oktet / angka kunci => 99 / 64 = 1,xxx
```

Dari hasil diatas kita tidak memerlukan angka dibelakang koma, kita hanya perlu angka di depan koma, silahkan diingat.

Untuk mengetahui `ip network` kita, angka hasil tadi angka hasil tadi dikalikan lagi dengan angka kunci.

```plain
1 * 64 = 64
```

Ip network didapatkan dengan menukar oktet yang menjadi operasi dengan angka hasil diatas
    
```plain
Ip : 192.168.88.99/26
Network : 192.168.88.64/26
```     

> _Sekedar tambahan, untuk mengetahui banyak nya subnet yang mungkin bisa dibuat dengan membagikan 256 ( total ip ) dengan angka kunci untuk oktet1, karena untuk oktet selanjutnya ada sedikit tambahan_

### Broadcast

Seperti teorinya ip broadcast merupakan ip terakhir dari sebuah subnet, karena jumlah ip pada prefiks /26 adalah 64, maka broadcast seharusnya adalah

```plain
64 + 64 - 1 = 127

Ip : 192.168.88.99/26
Network : 192.168.88.64/26
Broadcast : 192.168.88.127/26
```
    
> kenapa dikurang 1 karena perhitungan ip dimulai dari 0, dan jika tidak ditambahkan maka angka yang didapatkan adalah ip network dari subnet selanjutnya (jika tidak percaya coba saja pasti nggak konek)

### Netmask

Untuk mengetahui ip netmask mudah saja, sesuai teori seluruh bit dijadikan 1, kecuali host id atau dibelakang prefiks, tapi sesuai janji di atas tidak dalam perhitungan kita akan membuang jauh jauh biner, maka langsung saja, ubah seluruh ip menjadi `255`, kecuali oktet yang dioperasikan ( sampe ke belakang, jika ada )

```plain
Ip 			: 192.168.88.99/26
Network 	: 192.168.88.64/26
Broadcast 	: Network : 192.168.88.127/26
Netmask 	: 255.255.255.xxx
```

Nah, untuk xxx kita isi dengan apa? Mudah saja, cukup dengan _mengurangkan_ `256` ( jumlah ip ) dengan `angka kunci`

    256 - 64 = 192
    
    Ip : 192.168.88.99/26
    Network : 192.168.88.64/26
    Broadcast : Network : 192.168.88.127/26
    Netmask : 255.255.255.192

### Range Ip

Untuk mencari ip yang mungkin digunakan oleh client ataupun gateway, mudah saja, range ip yaitu `seluruh angka diantara` `ip network` dan `ip broadcacst`

```plain
Ip 			: 192.168.88.99/26
Network 	: 192.168.88.64/26
Broadcast 	: 192.168.88.127/26
Netmask 	: 255.255.255.192
Range Ip 	: 192.168.88.65/26 - 192.168.88.126/26
```

### Jumlah Host

Yang ini favorit saya, caranya dengan mengurangkan angka kunci dengan 2 atau menghitung range ip tadi, silahkan dipilih mana paling mudah :v

```plain
62 - 2 = 62
```

kenapa dikurang 2, yaa simpel saja karena 2 ip telah dipakai oleh network dan broadcast

```plain
Ip 			: 192.168.88.99/26
Network 	: 192.168.88.64/26
Broadcast 	: 192.168.88.127/26
Netmask 	: 255.255.255.192
Range Ip 	: 192.168.88.65/26 - 192.168.88.126/26
Jumlah Host : 62 
```

Setelah semua nya didapatkan, kita perlu….

Memvalidasi Hasil
-----------------

Untuk mengetahui hasil subneting kita betul sebenarnya mudah saja, langsung di test saja, jika konek berarti Ok jika tidak berarti yaa nggak.. Atau cara paling mudah lewat ip calculator, cepat, akurat, dan ga perlu ngapal tabel bantu.. hhmm..

Dari hasilnya sih valid.. Gimana? Mudahkan ( _pake ip calculator_ ) ? Makanya, next nya pake ip calculator saja..

Cek [hasil](https://jodies.de/ipcalc?host=192.168.88.99&mask1=26&mask2=).

Mungkin cukup sekian, semoga bermanfaat dan semoga bisa membantu dalam mengurangi beban pikiran.. Terima kasih..

_\*Eittsss.. bentar, itukan pake IP Kelas C, kalo IP Kelas B sama kelas A bagaiman? mungkin lain kali.._