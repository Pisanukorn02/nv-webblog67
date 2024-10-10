
<template>
    <div>
        <div class="blog-header">
            <h2>ส่วนจัดการบล๊อก</h2>
            <form>
 <input type="text" v-model="search" placeholder="Search">
 </form>
            <div>
                <button v-on:click="navigateTo('/blog/create')">สร้างบล็อก</button>
                <strong> จำนวนบล็อก: </strong> {{ blogs.length }}
            </div>
            <br>
        </div>
        <div v-if="blogs.length === 0" class="empty-blog">
            *** ไม่มีข้อมูล ***
        </div>
        <div v-for="blog in blogs" v-bind:key="blog.id" class="blog-list">
            <!-- แสดง Thumbnail ถ้ามี -->
            <div class="blog-pic">
                <transition name="fade">
                    <div class="thumbnail-pic" v-if="blog.thumbnail && blog.thumbnail !== 'null'">
                        <img :src="BASE_URL + blog.thumbnail" alt="Thumbnail">
                    </div>
                </transition> 
            </div>
 <div v-if="blog.pictures && blog.pictures !== 'null'" class="additional-pictures">
                    <ul>
                        <li v-for="picture in blog.picturesArray" :key="picture.id">
                            <img :src="BASE_URL + picture.name" alt="Picture">
                        </li>
                    </ul>
                </div>
            <h3>{{ blog.title }}</h3>
            <h3>{{ blog.PartName }}</h3>
            <div v-html="blog.content.slice(0,200) + '...'"></div> 
            <div class="blog-info">
                <p><strong>Category:</strong> {{ blog.category }}</p>
                <p><strong>Stock date :</strong> {{ formatDate(blog.createdAt) }}</p>
                <!-- แสดง Pictures ถ้ามี -->
                
                <p>
                    <button class="view-button" v-on:click="navigateTo('/blog/' + blog.id)">ดูบล็อก</button>
                    <button class="edit-button" v-on:click="navigateTo('/blog/edit/' + blog.id)">แก้ไขบล็อก</button>
                    <button class="delete-button" v-on:click="deleteBlog(blog)">ลบข้อมูล</button>
                </p>
            </div>
            <div class="clearfix"></div> 
        </div>
    </div>
</template>

<script>
import BlogsService from '@/services/BlogsService'
import _ from 'lodash'

export default {
    data () {
        return {
            blogs: [],
            BASE_URL: "http://localhost:8081/assets/uploads/",
            search: '', // เพิ่มฟิลด์ค้นหา
        }
    },
    created () {
        this.fetchBlogs()
    },
    methods: {
        logout () {
            this.$store.dispatch('setToken', null)
            this.$store.dispatch('setBlog', null)
            this.$router.push({
                name: 'login'
            })
        },
        navigateTo (route) {
            this.$router.push(route)
        },
        async deleteBlog (blog) {
            let result = confirm("ต้องการลบข้อมูลใช่หรือไม่?")
            if (result) {
                try {
                    await BlogsService.delete(blog)
                    this.refreshData()
                } catch (err) {
                    console.log(err)
                }
            }
        },
        async refreshData() {
            await this.fetchBlogs()
        },
        async fetchBlogs(searchTerm = '') {
            try {
                const response = await BlogsService.index(searchTerm)
                // สมมติว่า pictures ถูกเก็บเป็น JSON string หรือชื่อไฟล์คั่นด้วยจุลภาค
                this.blogs = response.data.map(blog => {
                    let picturesArray = []
                    if (blog.pictures && blog.pictures !== 'null') {
                        try {
                            // ลอง parse เป็น JSON
                            picturesArray = JSON.parse(blog.pictures)
                        } catch (e) {
                            // ถ้าไม่ใช่ JSON, แยกด้วยจุลภาค
                            picturesArray = blog.pictures.split(',').map((name, index) => ({
                                id: index + 1,
                                name: name.trim()
                            }))
                        }
                    }
                    return {
                        ...blog,
                        picturesArray
                    }
                })
            } catch (err) {
                console.log("Error fetching blogs:", err)
            }
        },
        formatDate(dateStr) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            return new Date(dateStr).toLocaleDateString(undefined, options)
        }
    },
    watch: {
        search: _.debounce(function (value) {
            const route = {
                name: 'blogs'
            }
            if (this.search !== '') {
                route.query = {
                    search: this.search
                }
            }
            console.log('search: ' + this.search)
            this.$router.push(route)
        }, 700),
        '$route.query.search': {
            immediate: true,
            async handler (value) { 
                this.fetchBlogs(value)
            } 
        }
    }
}
</script>




<style scoped>
.empty-blog {
    width: 100%;
    text-align: center;
    padding: 10px;
    background: darksalmon;
    color: white;
    margin-bottom: 20px;
}

/* Thumbnail */
.thumbnail-pic img {
    width: 200px;
    padding: 5px 10px 0px 0px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

/* Additional Pictures */
.additional-pictures {
    margin-top: 10px;
}

.additional-pictures ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
}

.additional-pictures li {
    margin-right: 10px;
    margin-bottom: 10px;
}

.additional-pictures img {
    max-width: 150px;
    height: auto;
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 4px;
}

/* Blog Info */
.blog-info {
    float: left;
    margin-left: 10px;
}

/* Blog Picture */
.blog-pic {
    float: left;
}

/* Blog List */
.blog-list {
    border: solid 1px #dfdfdf;
    margin-bottom: 20px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    padding: 10px;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.1);
    display: flex;
    flex-direction: column;
}

/* Blog Header */
.blog-header {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.blog-header button {
    padding: 8px 16px;
    margin-right: 10px;
    background-color: #42b983; /* ปุ่มสร้างบล็อก */
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.blog-header button:hover {
    background-color: #369870;
}

/* ปุ่มสีต่างๆ */
.view-button {
    background-color: #4CAF50; /* สีเขียว */
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
}

.edit-button {
    background-color: #FFC107; /* สีเหลือง */
    color: black;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
}

.delete-button {
    background-color: #F44336; /* สีแดง */
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
}

.view-button:hover,
.edit-button:hover,
.delete-button:hover {
    opacity: 0.9; /* เปลี่ยนสีเล็กน้อยเมื่อ hover */
}

/* Clearfix */
.clearfix {
    clear: both;
}
</style>

