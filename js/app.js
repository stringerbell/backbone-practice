// taken from http://stackoverflow.com/a/1186309
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var User = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('Users'),
});

var Users = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('Users'),
    model: User
});

var UserList = Backbone.View.extend({
    el: '.page',
    render: function() {
        var users = new Users();
        var that = this;
        users.fetch({
            success: function(users){
                var template = _.template($('#user-list-template').html(), {users: users.models});
                that.$el.html(template);
            }
        });
    }
});

var EditUser = Backbone.View.extend({
    el: '.page',
    render: function (options) {

        if (options.id) {
            var that = this;
            that.user = new User({id: options.id});
            that.user.fetch({
                success: function(user) {
                    var template = _.template($('#edit-user-template').html(), {user: user});
                    that.$el.html(template);
                }
            });
        } else {
            var template = _.template($('#edit-user-template').html(), {user: null});
            this.$el.html(template);
        }
    },
    events: {
        'submit .edit-user-form': 'saveUser',
        'click .delete': 'deleteUser'

    },
    saveUser: function (e) {
        $('.error-container').children().remove();
        var form = $(e.currentTarget).serializeObject();
        var valid = validateForm(form);
        if (valid !== true) {
            for (var e in valid.messages) {
                console.log(valid.messages[e]);
                $('.error-container').append('<div class="alert-danger alert">'+valid.messages[e]+'</div>');
            }
            return false;
        }
        var user = new User();

        user.save(form, {
            success: function () {
//                router.navigate('', {trigger: true});
                // using this instead of router.navigate because of a delay in storing stuff with local storage
                window.location.replace('/CodeFellows/Backbone/');
            }
        });
        return false;
    },
    deleteUser: function(e) {

        this.user.destroy({
            success: function() {
                router.navigate('', {trigger: true});
            }
        });
        return false;
    }
});

//ideally done on the server, but since we're storing stuff in localstorage, it won't really matter.
function validateForm(form) {
    var errors = {
        messages: {}
    };
    var valid = true;
    if (form.firstname.trim() === "") {
        errors.messages['firstName'] = "First Name Is Required.";
        valid = false;
    }

    if (!/(.+)@(.+){1,}\.(.+){2,}/.test(form.email)) {
        errors.messages['email'] = "Invalid Email Address";
        valid = false;
    }
    if (!valid) {
        return errors;
    }
    return true;
}


var Router = Backbone.Router.extend({
    routes: {
        '': 'home',
        'new': 'editUser',
        'edit/:id': 'editUser'
    }
});

var userList = new UserList();
var editUser = new EditUser();

var router = new Router();
router.on('route:home', function(){
    userList.render();
});
router.on('route:editUser', function(id){
    editUser.render({id: id});
});

Backbone.history.start();