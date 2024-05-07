Gate Simulation Docs

Script berikut digunakan untuk melakukan simulasi klien untuk menguji kemampuan gate server. Terdapat beberapa parameter yang bisa digunakan untuk mengkustomisasi simulasi.

host & port

Kedua parameter tersebut untuk konfigurasi target server.


clientPerWorker => jumlah klien dalam satu worker
worker => jumlah worker

Kedua parameter tersebut digunakan untuk menentukan berapa jumlah klien yang ingin dibuat dari simulasi. Total klien yang didapat adalah clientPerWorker * worker.


waitForReply => nilai boolean

parameter tersebut digunakan untuk menentukan metode pengiriman. Setiap pngiriman data terjadi setiap 10 detik. Terdapat 2 metode pengiriman. 

- Tanpa Menunggu reply dari server, device akan terus menerus mengirimkan setiap 10 detik.
- Dengan menunggu reply dari server. Sehingga jika sudah lewat 10 detik, akan tetapi belum ada reply, maka device akan menambahkan nilai 1 pada queuedAmount. Kemudian akan mencoba mengecek setiap detik. Jika sudah mendapat balasan, dan sudahmengirim, maka akan mengurangi nilai 1 pada queuedAmount. Ketika masih menunggu reply dan jika belum mendapat balasan hingga 10 detik berikutnya lagi (20 detik), maka tetap akan menambah queuedAmount.


generateDelay => waktu delay antara pembuatan klien


======================================================================================================

Dalam sistem operasi, terdapat batasan berapa jumlah klien/koneksi yang dapat dibuat dalam satu mesin ke sebuah port yang sama. Saat ini penulis menggunakan sistem operasi Pop Os, berbasis Ubuntu, terdapat batasan berikut.

- Jika server dan klien berada pada satu host yang sama, yang berarti koneksi dibuat adalah localhost/loopback, maka jumlah maksimal koneksi yang dapat dibuat adalah 56432 koneksi/klien.
- Jika server dan klien berada pada host yang berbeda, baik pada mesin yang berbeda, ataupun dalam satu mesin, bedaOS (menggunakan VM/kontainer), maka jumlah maksimal koneksi yang dapat dibuat adalah 28231 koneksi/klien.



Environment Variable Example

HOST "localhost"\
PORT 2000\
CLIENT_PER_WORKER 1000\
WORKER_COUNT 2\
WAIT_FOR_REPLY true\
GENERATE_DELAY 0\
DEVICE concox