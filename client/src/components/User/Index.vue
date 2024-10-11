<template>
  <div class="user-container">
    <h1>Users</h1>
    <div class="create-user">
      <button @click="navigateTo('/user/create')" class="btn-create">Register</button>
    </div>
    <hr>
    <div v-if="users.length">
      <div><b>จำนวนผู้ใช้งาน:</b> {{ users.length }}</div>
      <div v-for="user in users" :key="user.id" class="user-card">
        <div><b>ID:</b> {{ user.id }}</div>
        <div><b>ชื่อผู้ใช้:</b> {{ user.name }} {{ user.lastname }}</div>
        <div><b>อีเมล:</b> {{ user.email }}</div>
        <div><b>Status:</b> {{ user.status }}</div>
        <div><b>Type:</b> {{ user.type }}</div>
        
        <div class="user-actions">
          <button @click="navigateTo('/user/' + user.id)" class="btn-view">ดูข้อมูล</button>
          <button @click="navigateTo('/user/edit/' + user.id)" class="btn-edit">แก้ไขข้อมูล</button>
          <button @click="deleteUser(user)" class="btn-delete">ลบข้อมูล</button>
        </div>
        <hr>
      </div>
    </div>
    <div><button @click="logout" class="btn-logout">Logout</button></div>
  </div>
</template>

<script>
import UsersService from "@/services/UsersService";

export default {
  data() {
    return {
      users: []
    };
  },
  async created() {
    try {
      this.users = (await UsersService.index()).data;
    } catch (err) {
      console.log(err);
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      this.$router.push({ name: 'login' });
    },
    navigateTo(route) {
      this.$router.push(route);
    },
    async deleteUser(user) {
      let result = confirm("คุณต้องการลบข้อมูลใช่หรือไม่?");
      if (result) {
        try {
          await UsersService.delete(user);
          this.refreshData();
        } catch (err) {
          console.log(err);
        }
      }
    },
    async refreshData() {
      try {
        this.users = (await UsersService.index()).data;
      } catch (err) {
        console.log(err);
      }
    }
  }
};
</script>

<style scoped>
.user-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.create-user {
  text-align: right;
}

.btn-create,
.btn-view,
.btn-edit,
.btn-delete,
.btn-logout {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-create {
  background-color: #28a745; /* สีเขียว */
  color: white;
}

.btn-create:hover {
  background-color: #218838;
}

.user-card {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: #fff;
}

.user-actions {
  margin-top: 10px;
}

.btn-view {
  background-color: #007bff; /* สีฟ้า */
  color: white;
}

.btn-view:hover {
  background-color: #0056b3;
}

.btn-edit {
  background-color: #ffc107; /* สีเหลือง */
  color: black;
}

.btn-edit:hover {
  background-color: #e0a800;
}

.btn-delete {
  background-color: #dc3545; /* สีแดง */
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

.btn-logout {
  background-color: #6c757d; /* สีเทา */
  color: white;
  margin-top: 20px;
}

.btn-logout:hover {
  background-color: #5a6268;
}
</style>
