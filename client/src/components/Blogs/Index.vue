<template>
    <section>
        <header class="blog-header">
            <h2>Blogs</h2>
            <div>
                <form @submit.prevent="refreshData">
                    <input 
                        type="text" 
                        v-model="search" 
                        placeholder="Search" 
                        aria-label="Search Blogs" 
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <div>
                <div class="blog-actions">
                    <button @click="navigateTo('/blog/create')">Create Blog</button>
                    <ul class="categories">
                        <li v-for="cate in category" :key="cate">
                            <a @click.prevent="setCategory(cate)" href="#">{{ cate }}</a>
                        </li>
                        <li class="clear">
                            <a @click.prevent="setCategory('')" href="#">Clear</a>
                        </li>
                    </ul>
                </div>
                <div class="clearfix"></div>
                <strong>จำนวน blog: </strong> {{ filteredBlogs.length }}
            </div>
            <br />
        </header>

        <!-- No data message -->
        <div v-if="!filteredBlogs.length" class="empty-blog">
            *** ไม่มีข้อมูล ***
        </div>

        <!-- Blog list -->
        <section v-else>
            <article 
                v-for="blog in paginatedBlogs" 
                :key="blog.id" 
                class="blog-list" 
                :aria-labelledby="'blog-' + blog.id"
            >
                <!-- แสดง Thumbnail ถ้ามี -->
                <div class="blog-pic">
                    <transition name="fade">
                        <div v-if="blog.thumbnail && blog.thumbnail !== 'null'" class="thumbnail-pic">
                            <img :src="BASE_URL + blog.thumbnail" alt="Blog Thumbnail" />
                        </div>
                    </transition>
                </div>

               

                <div class="blog-info">
                    <div v-if="blog.picturesArray && blog.picturesArray.length > 0" class="additional-pictures">
                        <ul>
                            <li v-for="picture in blog.picturesArray" :key="picture.id">
                                <img :src="BASE_URL + picture.name" alt="Picture">
                            </li>
                        </ul>
                    </div>
                    <p><strong>Name :</strong> {{ blog.PartName }}</p>
                    <p><strong>Price :</strong> {{ blog.Price }}</p>
                    <p><strong>Category:</strong> {{ blog.category }}</p>
                    <p><strong>Stock date:</strong> {{ formatDate(blog.createdAt) }}</p>
                    
                    
                    
                    <div class="blog-actions">
                        <button @click="navigateTo('/blog/' + blog.id)" class="btn-view">View Blog</button>
                        <button @click="navigateTo('/blog/edit/' + blog.id)" class="btn-edit">Edit blog</button>
                        <button @click="deleteBlog(blog)" class="btn-delete">ลบข้อมูล</button>
                    </div>
                </div>
                <div class="clearfix"></div>
            </article>

            <!-- Load complete message -->
            <footer id="blog-list-bottom">
                <div v-if="paginatedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0" class="footer-message">
                    โหลดข้อมูลครบแล้ว
                </div>
            </footer>
        </section>
    </section>
</template>
  
<script>
import BlogsService from '@/services/BlogsService';
import _ from 'lodash';
import ScrollMonitor from 'scrollMonitor';

export default {
    data() {
        return {
            blogs: [],
            search: '',
            BASE_URL: 'http://localhost:8081/assets/uploads/',
            LOAD_NUM: 3,
            pageWatcher: null,
            allBlogs: [],
            currentPage: 1,
            category: [],
            loading: false,
        };
    },
    async created() {
        await this.refreshData();
    },
    computed: {
        filteredBlogs() {
            if (this.search) {
                const searchLower = this.search.toLowerCase();
                return this.allBlogs.filter((blog) =>
                    
                    blog.category.toLowerCase().includes(searchLower)
                );
            }
            return this.allBlogs;
        },
        paginatedBlogs() {
            return this.filteredBlogs.slice(0, this.currentPage * this.LOAD_NUM);
        },
    },
    methods: {
        navigateTo(route) {
            this.$router.push(route);
        },
        async deleteBlog(blogId) {
            let result = confirm("ต้องการลบข้อมูลใช่หรือไม่?");
            if (result) {
                try {
                    await BlogsService.delete(blogId);
                    this.refreshData();
                } catch (err) {
                    console.log(err);
                    alert("ลบข้อมูลไม่สำเร็จ");
                }
            }
        },
        async refreshData() {

            try {
                const response = await BlogsService.index(this.search);
                console.log('Blogs fetched:', response.data); // เพิ่ม log
                this.allBlogs = response.data.map(blog => {
                    let picturesArray = [];
                    if (blog.pictures && blog.pictures !== 'null') {
                        try {
                            // ลอง parse เป็น JSON
                            picturesArray = JSON.parse(blog.pictures);
                        } catch (e) {
                            // ถ้าไม่ใช่ JSON, แยกด้วยจุลภาค
                            picturesArray = blog.pictures.split(',').map((name, index) => ({
                                id: index + 1,
                                name: name.trim()
                            }));
                        }
                    }
                    return {
                        ...blog,
                        picturesArray
                    };
                });
                this.populateCategories();
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        },
        loadMoreBlogs() {
            this.currentPage++;
        },
        handleScroll() {
            if (this.pageWatcher && this.pageWatcher.isInViewport) {
                this.loadMoreBlogs();
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('th-TH', options);
        },
        setCategory(keyword) {
            this.search = keyword.trim();
            this.refreshData(); // เรียกใช้เมื่อเลือกหมวดหมู่
        },
        populateCategories() {
            this.category = [];
            this.allBlogs.forEach(blog => {
                if (blog.category && !this.category.includes(blog.category)) {
                    this.category.push(blog.category);
                }
            });
        },
    },
    watch: {
        search: _.debounce(async function (value) {
            this.refreshData();
        }, 700),
    },
    mounted() {
        const sens = document.querySelector('#blog-list-bottom');
        if (sens) {
            this.pageWatcher = ScrollMonitor.create(sens);
            this.pageWatcher.enterViewport(this.handleScroll);
        }
    },
    beforeDestroy() {
        if (this.pageWatcher) {
            this.pageWatcher.destroy();
        }
    },
};
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
    padding: 5px 10px 0 0;
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
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

/* Blog Header */
.blog-header {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.blog-header form {
    width: 100%;
    margin-bottom: 10px;
}

.blog-header button {
    padding: 8px 16px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.blog-header button:hover {
    background-color: #369870;
}

/* Categories */
.categories {
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.categories li a {
    padding: 5px 10px;
    background: paleturquoise;
    color: black;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.3s;
}

.categories li a:hover {
    background: #40e0d0;
}

.categories li.clear a {
    background: tomato;
    color: white;
}

.blog-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    margin-top: 10px;
}

.blog-actions button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
}

/* ปุ่มดู Blog - สีเขียว */
.btn-view {
    background-color: #28a745; /* สีเขียว */
    color: white;
}

.btn-view:hover {
    background-color: #218838;
}

/* ปุ่มแก้ไข Blog - สีเหลือง */
.btn-edit {
    background-color: #ffc107; /* สีเหลือง */
    color: black;
}

.btn-edit:hover {
    background-color: #e0a800;
}

/* ปุ่มลบข้อมูล - สีแดง */
.btn-delete {
    background-color: #dc3545; /* สีแดง */
    color: white;
}

.btn-delete:hover {
    background-color: #c82333;
}

/* Footer Message */
.footer-message {
    color: #28a745; /* สีเขียว */
    text-align: center;
    margin-top: 10px;
}

/* Clearfix */
.clearfix {
    clear: both;
}
</style>
