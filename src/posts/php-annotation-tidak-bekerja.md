---
title: "PHP: Annotations Tidak Bekerja"
description: "Annotation digunakan untuk memberikan tambahan meta data pada kode. (update: sudah ada php attribute di PHP 8)"
date: 2020-12-30
tags: posts
category: kode
category_url: kode/index.html
layout: post
permalink: kode/php-annotation-tidak-bekerja.html
---
Annotation merupakan sebuah cara untuk menambahkan meta data atau tag pada kode. Annotation ini sering dipergunakan untuk class, property ataupun method untuk mempengaruhi perilakunya. Pada PHP, fitur ini bisa kita gunakan, walaupun tidak datang secara built-in di PHP. (_Lupakan sejenak [PHP 8](https://coretanit.com/fitur-baru-php-8/) dengan attributes-nya)_


Annotation biasanya ditandai dengan <strong>@</strong> kemudian diikuti oleh annotasinya. Annotation ditulis pada docblocknya php, sebagai contoh berikut ini dari [https://en.wikipedia.org/wiki/Docblock#PHP](wikipedia).

```php
<?php

/**
 * @method POST
 * This is a comment of documentation (Doc Block)
 **/
public function store(Request $request): void
{
    // Method actions here
}
```

Nah, pada tutorial ini, saya akan sedikit membahas sebuah permasalahan yang sebenarnya sangat jarang terjadi, yaitu annotation yang kita buat ternyata tidak bekerja.

Memangnya seberapa fatal jika annotation tidak bekerja? hmm..sebagai informasi annotation banyak sekali diadopsi oleh php framework maupun library seperti Symfony, Laravel, Zend, Doctrine, PHPUnit dan sebagainya. Alhasil, jika annotation nya tidak bekerja, otomatis kita tidak akan bekerja sebagaimana mestinya.

Lalu, bagaimana mengatasinya? Akan kita bahas secara sederhana..

## Menganalisa Masalah
Seperti yang sudah kita ketahui bersama bahwa annotation bekerja di bawah php docblock yang notabenenya adalah komentar pada PHP, secara tidak langsung bisa kita simpulkan bahwa jika annotation nya tidak bekerja itu berarti ada yang salah saat parsing komentar.

Mari kita coba..

Caranya mudah saja, kita cukup siapkan sebuah class dengan docblock nya kemudian kita gunakan php Reflection untuk mengambil doc nya.


Sebagai contoh, file `MyClassWithDockBlock.php`

```php
<?php

/**
 * This is a docblock
 */
class MyClassWithDocBlock
{}

$ref = new ReflectionClass(MyClassWithDocBlock::class);

var_dump($ref->getDocComment());
```
Seharusnya, jita komentar baik baik saja saat kita menjalankan kode program, maka akan menampilkan sebagai berikut.

```php
string(29) "/** * This is a docblock */" 
```
tapi, saat ini pada kenyataanya komentar pada php kita tidak sedang baik baik saja, sehingga hasilnya yang keluar adalah `boolean`, dan tidak terdapat komentar yang kita maksud, alias dibuang.

```php
bool(false) 
```
Ini lah yang menyebabkan annotation kita tidak bekerja sebagaimana semestinya, komentarnya saja tidak diparsing apalagi annotation nya 🙂


## Perbaikan
Untuk menyelesaikan masalah ini, mudah saja, kita sudah mengetahui biang keladi nya adalah komentar atau doc block tidak diparsing. Kenapa ini bisa terjadi? Sebenarnya ini bukan kesalahan, hal ini adalah lumrah, karena terkadang dengan tujuan untuk mengoptimasi kode komentar tidak diikutsertakan ke dalam opcode cache. Apa itu opcode? Singkatnya, hasil compile dari script php sebelum dieksekusi. Jadi, caching nya hanya murni kode tidak ada komentar, alhasil kode sedikit tereduksi.

Nah, untuk mengikutsertakan komentar ke opcode, kita perlu mengobok obok file settingan php, yaitu `php.ini`. Dimana di file ini seluruh setingan php disimpan.

Nah, sejak kedatangan php5.5 hingga sekarang untuk urusan caching opcode ini dihandle oleh sebuah ektensi yang bernama `PHP OpCache`.  Dan di setingan ekstensi ini lah yang akan kita obok obok di `php.ini`

```bash
php -i | grep "opcache"
```
Dengan perintah diatas, seluruh setingan `opcache` di `php.ini` akan  ditampilkan. (Jika memakai windows, gunakan `findstr` atau cari manual di `phpinfo()` )
```bash
/etc/php/7.4/cli/conf.d/10-opcache.ini,
opcache.blacklist_filename => no value => no value
opcache.consistency_checks => 0 => 0
opcache.dups_fix => Off => Off
opcache.enable => On => On
opcache.enable_cli => Off => Off
opcache.enable_file_override => Off => Off
opcache.error_log => no value => no value
opcache.file_cache => no value => no value
opcache.file_cache_consistency_checks => On => On
opcache.file_cache_only => Off => Off
opcache.file_update_protection => 2 => 2
opcache.force_restart_timeout => 180 => 180
opcache.huge_code_pages => Off => Off
opcache.interned_strings_buffer => 8 => 8
opcache.lockfile_path => /tmp => /tmp
opcache.log_verbosity_level => 1 => 1
opcache.max_accelerated_files => 10000 => 10000
opcache.max_file_size => 0 => 0
opcache.max_wasted_percentage => 5 => 5
opcache.memory_consumption => 128 => 128
opcache.opt_debug_level => 0 => 0
opcache.optimization_level => 0x7FFEBFFF => 0x7FFEBFFF
opcache.preferred_memory_model => no value => no value
opcache.preload => no value => no value
opcache.preload_user => no value => no value
opcache.protect_memory => Off => Off
opcache.restrict_api => no value => no value
opcache.revalidate_freq => 2 => 2
opcache.revalidate_path => Off => Off
opcache.save_comments => Off => Off
opcache.use_cwd => On => On
opcache.validate_permission => Off => Off
opcache.validate_root => Off => Off
opcache.validate_timestamps => On => On
```
Buset,, banyak.. jangan khawatir setingan itu diabaikan saja, kita cukup berfokus ke setingan komentar dan karena php tidak menggunakan bahasa Indonesia tetapi bahass Inggris, jadi kita cari `comment` saja.
```bash
php -i | grep "opcache" | grep "comment"
```

Dan seharusnya di layar menampilkan nilai,

```bash
opcache.save_comments => Off => Off
```
Yaaps, sesuai perkiraan di awal, komentar tidak dimasukkan ke cache karena status nya di-Off-kan. Untuk meng-On-kan nya kita perlu mengubah settingan ini pada file `php.ini`. 


Sebelumnya telah kita ketahui bahwa settingan ini ada pada `opcache.save_comments` dengan nilai nya adalah `Off` atau `0` dalam binary format. Sehingga, untuk mengaktifkannya kita perlu menggantinya ke On atau 1, dengan (_*terkadang butuh permission)_

```php
sed -i 's,opcache.save_comments\=0,opcache.save_comments\=1,' /path/to/your/php/php.ini
```

Dan seharusnya jika kita cek settingan php.ini sudah berubah

```bash
php -i | grep "opcache.save_comments"
```
Sekarang harusnya sudah menghasilkan nilai `On`,

```bash
opcache.save_comments => On => On
```

Dan, sekarang coba jalankan kembali file `MyClassWithDockBlock.php` dan seharusnya sudah menampilkan komentar yang kita maksud.

## Tes Annotation
Seharusnya, sampain pada part sebelumnya annotation sudah bekerja dengan normal, dan aplikasi sudah bisa berjalan. Tapi, untuk lebih meyakinkan dan kebutuhan eksperimen, kita akan mencoba annotation dengan contoh yang sederhana.

Untuk contoh ini, kita akan menggunakan library annotation dari doctrine, silahkan setup project dan install

```bash
mkdir test-annotation
cd test-annotation
composer init
```

Kemudian langsun saja diinstall annotationnya,

```bash
composer require doctrine/annotations
```

Untuk pengujian, pertama kita buat class annotationnya, contoh `SomeAnnotation.php`

```php
<?php

/**
 * @Annotation
 */
class SomeAnnotation
{
    public $someProperty; 
}
```

Kemudian kita buat class yang akan meload annotation kita, sekaligus memberi nilai property nya, contoh `MyClass.php` dengan nilai string `Hello, Annotation!`

```php
<?php

/**
* @SomeAnnotation(someProperty="Hello, Annotation!")
*/
class MyClass
{}

```

Nah, untuk sebagai entry point, kita buat file `index.php` dan kita load seluruh class untuk diuji, juga annotation reader dari doctrine agar bisa dikenali.

```php
<?php

require __DIR__ . "/vendor/autoload.php";

require __DIR__ . "/SomeAnnotation.php";
require __DIR__ . "/MyClass.php";

use Doctrine\Common\Annotations\AnnotationReader;

$reader = new AnnotationReader();

$refClass = new ReflectionClass(MyClass::class);
$classAnnotation = $reader->getClassAnnotations($refClass); // array

var_dump($classAnnotation[0]->someProperty); // ?string
```

Untuk menguji kode diatas, silahkan dijalankan. Dan masih kita ingat diatas pada part perbaikan, kita sudah mengaktifkan komentar dan annotation bekerja sepert biasa dan menghasilkan ekspektasi kita, yaitu `Hello, Annotation!`. 

Dan jika, `opcache.save_comments` kita set jadi `0`, maka harusnya hasil yang kita dapat bernilai false, disertai notice karena comment tidak diload, 

```html
PHP Notice: Undefined offset: 0
PHP Notice: Trying to get property 'someProperty' of non-object
```

Dari percobaan sederhana ini, kita paham bahwa annotationnya tidak diload dengan semestinya.

Demikian tentang penyelesaian tentang annotation yang tidak bekerja, jangan lupa tetap improve lebih dalam dan semoga bermanfaat..