<template>
  <div class="login-container">
    <h1>User Login</h1>
    <form v-on:submit.prevent="onLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          v-model="password"
          required
        />
      </div>
      <button type="submit" class="btn-login">Login</button>
      <div class="error" v-if="error">{{ error }}</div>
      
    </form>
  </div>
</template>

<script>
import AuthenService from "../services/AuthenService";
export default {
  data() {
    return {
      email: "",
      password: "",
      error: null,
    };
  },
  methods: {
    async onLogin() {
      try {
        const response = await AuthenService.login({
          email: this.email,
          password: this.password,
        });

        this.$store.dispatch("setToken", response.data.token);
        this.$store.dispatch("setUser", response.data.user);

        this.$router.push({
          name: "users",
        });
      } catch (error) {
        console.log(error);
        this.error = error.response.data.error;
        this.email = "";
        this.password = "";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto; /* จัดกลาง */
  padding: 20px;
  border: 1px solid #ccc; /* เส้นขอบ */
  border-radius: 8px; /* มุมโค้ง */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* เงา */
  background-color: #f9f9f9; /* พื้นหลังอ่อน */
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px; /* ระยะห่างระหว่างฟิลด์ */
}

label {
  font-weight: bold;
}

input[type="email"],
input[type="password"] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%; /* กว้าง 100% */
}

input:focus {
  border-color: #007bff; /* สีเส้นขอบเมื่อโฟกัส */
  outline: none; /* ลบเส้นขอบที่เป็นมาตรฐาน */
}

.btn-login {
  padding: 10px;
  background-color: #28a745; /* สีเขียว */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-login:hover {
  background-color: #218838; /* สีเขียวเข้มเมื่อโฮเวอร์ */
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px; /* ระยะห่างด้านบน */
}
</style>
