<template>
    <div>
      <h1>Parts List</h1>
      <p><button @click="$router.push('/part/create')">Create New Part</button></p>
      <div v-for="part in parts" :key="part.part_id">
        <p>Part Name: {{ part.part_name }}</p>
        <p>Category: {{ part.category }}</p>
        <p>Price: {{ part.price }}</p>
        <p>
          <button @click="editPart(part.part_id)">Edit</button>
          <button @click="deletePart(part.part_id)">Delete</button>
        </p>
        <hr />
      </div>
    </div>
  </template>
  
  <script>
  import PartsService from '@/services/PartsService';
  
  export default {
    data() {
      return {
        parts: []
      };
    },
    async created() {
      this.parts = await PartsService.getAll();
    },
    methods: {
      editPart(partId) {
        this.$router.push(`/part/edit/${partId}`);
      },
      async deletePart(partId) {
        if (confirm('Are you sure you want to delete this part?')) {
          await PartsService.delete(partId);
          this.parts = await PartsService.getAll(); // Refresh list
        }
      }
    }
  };
  </script>
  