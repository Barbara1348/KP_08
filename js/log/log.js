function log() {
    let userManager = new UsersManager();

    const stateUser = userManager.readCurrentUser();

    if (!stateUser) {
        window.location.href = "/log/";
    }

    else {
        window.location.href = "/profile/";
    }

}